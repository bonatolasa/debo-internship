import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { AppModule } from './../src/app.module';

describe('RBAC E2E', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URL = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const collection of Object.values(collections)) {
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  const registerUser = (payload: {
    name: string;
    email: string;
    password: string;
    roles: string[];
  }) =>
    request(app.getHttpServer())
      .post('/users')
      .send(payload)
      .expect(201);

  const loginUser = (email: string, password: string) =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

  it('lets a super_admin assign roles, repopulate permissions, and call a protected route', async () => {
    const stamp = Date.now();
    const superAdminEmail = `super+${stamp}@example.test`;
    await registerUser({
      name: 'Super Admin',
      email: superAdminEmail,
      password: 'SuperPass123!',
      roles: ['super_admin'],
    });

    const superLogin = await loginUser(superAdminEmail, 'SuperPass123!');
    const superToken = superLogin.body.data.accessToken;

    const memberEmail = `member+${stamp}@example.test`;
    const member = await registerUser({
      name: 'Team Member',
      email: memberEmail,
      password: 'MemberPass123!',
      roles: ['team_member'],
    });
    const memberId = member.body.data.id;

    const memberLogin = await loginUser(memberEmail, 'MemberPass123!');
    const memberToken = memberLogin.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/reports/protected/overview')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);

    const assignRes = await request(app.getHttpServer())
      .patch(`/users/${memberId}/roles`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({
        roles: ['team_member', 'admin'],
      })
      .expect(200);

    expect(assignRes.body.data.roles).toContain('admin');

    const elevatedLogin = await loginUser(memberEmail, 'MemberPass123!');
    const elevatedToken = elevatedLogin.body.data.accessToken;

    const protectedRes = await request(app.getHttpServer())
      .get('/reports/protected/overview')
      .set('Authorization', `Bearer ${elevatedToken}`)
      .expect(200);

    expect(protectedRes.body.data.roles).toContain('admin');
  });

  it('forbids non-super-admin users from assigning roles', async () => {
    const stamp = Date.now();
    const superAdminEmail = `super2+${stamp}@example.test`;
    await registerUser({
      name: 'Super Admin',
      email: superAdminEmail,
      password: 'SuperPass123!',
      roles: ['super_admin'],
    });

    const superLogin = await loginUser(superAdminEmail, 'SuperPass123!');
    const superToken = superLogin.body.data.accessToken;

    const memberEmail = `member2+${stamp}@example.test`;
    const member = await registerUser({
      name: 'Team Member',
      email: memberEmail,
      password: 'MemberPass123!',
      roles: ['team_member'],
    });
    const memberId = member.body.data.id;

    const memberLogin = await loginUser(memberEmail, 'MemberPass123!');
    const memberToken = memberLogin.body.data.accessToken;

    await request(app.getHttpServer())
      .patch(`/users/${memberId}/roles`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        roles: ['project_manager'],
      })
      .expect(403);

    // ensure super admin can still change roles
    const assignRes = await request(app.getHttpServer())
      .patch(`/users/${memberId}/roles`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({
        roles: ['project_manager'],
      })
      .expect(200);

    expect(assignRes.body.data.roles).toContain('project_manager');
  });
});
