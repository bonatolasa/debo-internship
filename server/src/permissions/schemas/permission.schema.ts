import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PermissionDocument extends Document {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;
}

export const PermissionSchema = SchemaFactory.createForClass(PermissionDocument);
