import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
  institutionId: mongoose.Types.ObjectId | string;
  title: string;
  /** Free-text date label, normally Bikram Sambat with the AD date, e.g. "2083-02-15 (May 28)". */
  date: string;
  term: 'FIRST' | 'SECOND' | 'THIRD' | 'FINAL';
  type: 'EXAMINATION' | 'HOLIDAY' | 'MILESTONE' | 'MEETING';
  description: string;
  createdBy?: mongoose.Types.ObjectId | string;
}

const CalendarEventSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    term: { type: String, enum: ['FIRST', 'SECOND', 'THIRD', 'FINAL'], default: 'FIRST' },
    type: { type: String, enum: ['EXAMINATION', 'HOLIDAY', 'MILESTONE', 'MEETING'], default: 'MILESTONE' },
    description: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = String(ret._id);
        ret.institutionId = String(ret.institutionId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CalendarEvent =
  mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema, 'calendarEvents');
