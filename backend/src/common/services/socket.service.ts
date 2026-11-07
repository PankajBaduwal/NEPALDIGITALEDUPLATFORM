import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env';
import { Section, StudentEnrollment } from '../../models';

export interface AuthenticatedSocketUser {
  userId: string;
  institutionId?: string;
  role: string;
  email?: string;
}

export class SocketService {
  private static io: SocketIOServer | null = null;

  /**
   * Initializes Socket.IO with CORS and JWT authentication middleware
   */
  static init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: true,
        credentials: true,
      },
      path: '/socket.io',
    });

    // JWT Authentication & Tenant Isolation Middleware
    this.io.use((socket: Socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace(/^Bearer\s+/, '') ||
          socket.handshake.query?.token;

        if (!token) {
          // Allow anonymous fallback for local smartboard canvas broadcast, or reject
          return next();
        }

        const decoded = jwt.verify(token as string, ENV.JWT_SECRET) as any;
        socket.data.user = {
          userId: decoded.userId || decoded.id,
          institutionId: decoded.institutionId,
          role: decoded.role,
          email: decoded.email,
        } as AuthenticatedSocketUser;

        next();
      } catch (err: any) {
        console.warn(`[Socket.IO] Auth verification failed: ${err.message}`);
        next(); // allow connection but unauthenticated
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = socket.data.user as AuthenticatedSocketUser | undefined;

      if (user) {
        // Join personal user room
        socket.join(`user:${user.userId}`);

        // Join tenant institution room
        if (user.institutionId) {
          socket.join(`institution:${user.institutionId}`);
          socket.join(`role:${user.institutionId}:${user.role}`);
        }
      }

      // Section rooms: only members of that section (students) or staff of the same institution may listen
      socket.on('join:section', async (data: { sectionId: string }) => {
        try {
          if (!user || !data?.sectionId) return;
          const section: any = await Section.findById(data.sectionId).populate('classId', 'institutionId').lean();
          if (!section || String(section.classId?.institutionId) !== String(user.institutionId)) return;
          if (user.role === 'STUDENT') {
            const mine = await StudentEnrollment.exists({ studentId: user.userId, sectionId: data.sectionId, status: 'ENROLLED' });
            if (!mine) return;
          }
          socket.join(`section:${data.sectionId}`);
        } catch {
          // ignore malformed requests
        }
      });

      socket.on('disconnect', () => {
        // Socket cleaned up automatically
      });
    });

    console.log('📡 Socket.IO Real-time Engine initialized with tenant isolation.');
    return this.io;
  }

  static getIO(): SocketIOServer | null {
    return this.io;
  }

  /** Rooms for the people who supervise the whole institution. */
  private static staffRooms(institutionId: string): string[] {
    return ['PRINCIPAL', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN'].map((r) => `role:${institutionId}:${r}`);
  }

  /** Push one notification to a user's open sessions so the bell updates without a reload. */
  static emitNotification(recipientId: string, payload: any) {
    if (!this.io) return;
    this.io.to(`user:${recipientId}`).emit('notification:new', payload);
  }

  /**
   * Real-time Broadcast: Attendance marked by subject teacher
   */
  static emitAttendanceMarked(institutionId: string, sectionId: string, payload: any) {
    if (!this.io) return;
    // Only that section and the school's supervisors need to know (not every student in the school)
    this.io.to(`section:${sectionId}`).to(this.staffRooms(institutionId)).emit('attendance:marked', payload);
  }

  /**
   * Real-time Broadcast: Marks workflow state transition
   */
  static emitMarksWorkflowChanged(institutionId: string, payload: any) {
    if (!this.io) return;
    this.io.to([...this.staffRooms(institutionId), `role:${institutionId}:TEACHER`]).emit('marks:workflow:changed', payload);
  }

  /**
   * Real-time Broadcast: Examination results officially published
   */
  static emitResultsPublished(institutionId: string, sectionId: string, payload: any) {
    if (!this.io) return;
    this.io.to(`section:${sectionId}`).to(this.staffRooms(institutionId)).emit('results:published', payload);
  }

  /**
   * Real-time Broadcast: New examination scheduled
   */
  static emitExaminationCreated(institutionId: string, payload: any) {
    if (!this.io) return;
    this.io.to(`institution:${institutionId}`).emit('examination:created', payload);
  }

  /**
   * Real-time Broadcast: Timetable or Schedule entry created, updated, or removed
   */
  static emitScheduleChanged(institutionId: string, payload: any) {
    if (!this.io) return;
    this.io.to(`institution:${institutionId}`).emit('timetable:updated', payload);
    if (payload.sectionId) {
      this.io.to(`section:${payload.sectionId}`).emit('timetable:section:updated', payload);
    }
    if (payload.teacherId) {
      this.io.to(`user:${payload.teacherId}`).emit('timetable:teacher:updated', payload);
    }
  }

  /**
   * Real-time Broadcast: Teacher substitution assignment
   */
  static emitSubstitutionAssigned(institutionId: string, payload: any) {
    if (!this.io) return;
    this.io.to(`institution:${institutionId}`).emit('substitution:assigned', payload);
    if (payload.substituteTeacherId) {
      this.io.to(`user:${payload.substituteTeacherId}`).emit('substitution:alert', payload);
    }
  }

  /**
   * Real-time Broadcast: Academic analytics updated
   */
  static emitAnalyticsUpdated(institutionId: string, payload: any) {
    if (!this.io) return;
    this.io.to(this.staffRooms(institutionId)).emit('analytics:updated', payload);
  }

  /**
   * Real-time Broadcast: Syllabus coverage updated
   */
  static emitSyllabusUpdated(institutionId: string, payload: any) {
    if (!this.io) return;
    this.io.to(this.staffRooms(institutionId)).emit('syllabus:updated', payload);
    if (payload.sectionId) {
      this.io.to(`section:${payload.sectionId}`).emit('syllabus:section:updated', payload);
    }
  }
}

