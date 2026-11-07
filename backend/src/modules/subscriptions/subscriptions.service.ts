import mongoose from 'mongoose';
import crypto from 'crypto';
import {
  Institution,
  User,
  SubscriptionPlan,
  InstitutionSubscription,
  SubscriptionEntitlement,
  Invoice,
  Payment,
  SubscriptionHistory,
  ISubscriptionPlan,
  IInstitutionSubscription,
  SubscriptionStatus,
  PaymentGatewayType,
} from '../../models';
import { PaymentGatewayFactory } from '../../common/services/payment-gateway';

export class SubscriptionsService {
  // ══════════════════════════════════════════════════════════════════
  // 1. DEFAULT NEPAL PACKAGES SEEDING
  // ══════════════════════════════════════════════════════════════════

  /**
   * Automatically initializes the 3 mandatory Nepal CDC packages + Comprehensive K-12
   * if none exist in the database.
   */
  static async seedDefaultNepalPlans(): Promise<void> {
    const count = await SubscriptionPlan.countDocuments();
    if (count > 0) return;

    const defaultPlans = [
      {
        code: 'FOUNDATION',
        tier: 'FOUNDATION',
        name: 'Foundation Package (Classes 1–5)',
        nameNepali: 'आधारभूत तह प्याकेज (कक्षा १–५)',
        description:
          'Comprehensive digital curriculum, interactive simulations, and textbook library tailored for primary education (Classes 1 to 5).',
        applicableGrades: [1, 2, 3, 4, 5],
        pricing: {
          currency: 'NPR',
          annualPriceNpr: 35000,
          monthlyPriceNpr: 3500,
          perStudentPriceNpr: 40,
        },
        features: {
          gradesCovered: [1, 2, 3, 4, 5],
          isTextbooksIncluded: true,
          isSimulationsIncluded: true,
          isActivitiesIncluded: true,
          isSmartBoardIncluded: true,
          isAiAssistantIncluded: true,
          isAcademicManagementIncluded: true,
          isAnalyticsIncluded: true,
        },
        limits: {
          maxStudents: 500,
          maxTeachers: 30,
          maxSmartBoards: 5,
          monthlyAiTokens: 50000,
        },
        isActive: true,
        isPublic: true,
        sortOrder: 1,
      },
      {
        code: 'MIDDLE_SCHOOL',
        tier: 'MIDDLE_SCHOOL',
        name: 'Middle School Package (Classes 6–8)',
        nameNepali: 'निम्न माध्यमिक तह प्याकेज (कक्षा ६–८)',
        description:
          'Science laboratories, geometry simulations, CDC textbooks, and examination management for middle school grades (Classes 6 to 8).',
        applicableGrades: [6, 7, 8],
        pricing: {
          currency: 'NPR',
          annualPriceNpr: 45000,
          monthlyPriceNpr: 4500,
          perStudentPriceNpr: 50,
        },
        features: {
          gradesCovered: [6, 7, 8],
          isTextbooksIncluded: true,
          isSimulationsIncluded: true,
          isActivitiesIncluded: true,
          isSmartBoardIncluded: true,
          isAiAssistantIncluded: true,
          isAcademicManagementIncluded: true,
          isAnalyticsIncluded: true,
        },
        limits: {
          maxStudents: 600,
          maxTeachers: 40,
          maxSmartBoards: 8,
          monthlyAiTokens: 100000,
        },
        isActive: true,
        isPublic: true,
        sortOrder: 2,
      },
      {
        code: 'SECONDARY',
        tier: 'SECONDARY',
        name: 'Secondary Package (Classes 9–12)',
        nameNepali: 'माध्यमिक तह प्याकेज (कक्षा ९–१२)',
        description:
          'Advanced physics/chemistry labs, SEE & NEB Grade 11-12 curriculum, marks workflow, timetable, and CDC analytics.',
        applicableGrades: [9, 10, 11, 12],
        pricing: {
          currency: 'NPR',
          annualPriceNpr: 65000,
          monthlyPriceNpr: 6500,
          perStudentPriceNpr: 65,
        },
        features: {
          gradesCovered: [9, 10, 11, 12],
          isTextbooksIncluded: true,
          isSimulationsIncluded: true,
          isActivitiesIncluded: true,
          isSmartBoardIncluded: true,
          isAiAssistantIncluded: true,
          isAcademicManagementIncluded: true,
          isAnalyticsIncluded: true,
        },
        limits: {
          maxStudents: 800,
          maxTeachers: 60,
          maxSmartBoards: 12,
          monthlyAiTokens: 200000,
        },
        isActive: true,
        isPublic: true,
        sortOrder: 3,
      },
      {
        code: 'K12_ALL',
        tier: 'K12',
        name: 'Comprehensive K–12 Ecosystem (Classes 1–12)',
        nameNepali: 'पूर्ण विद्यालय प्याकेज (कक्षा १–१२)',
        description:
          'Full institution access covering all 12 grades, all subjects, unlimited Smart Board connections, and priority AI tutoring.',
        applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        pricing: {
          currency: 'NPR',
          annualPriceNpr: 120000,
          monthlyPriceNpr: 11000,
          perStudentPriceNpr: 55,
        },
        features: {
          gradesCovered: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          isTextbooksIncluded: true,
          isSimulationsIncluded: true,
          isActivitiesIncluded: true,
          isSmartBoardIncluded: true,
          isAiAssistantIncluded: true,
          isAcademicManagementIncluded: true,
          isAnalyticsIncluded: true,
        },
        limits: {
          maxStudents: 2000,
          maxTeachers: 120,
          maxSmartBoards: 30,
          monthlyAiTokens: 500000,
        },
        isActive: true,
        isPublic: true,
        sortOrder: 4,
      },
    ];

    await SubscriptionPlan.insertMany(defaultPlans);
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. SUBSCRIPTION PLANS (PACKAGES) CRUD
  // ══════════════════════════════════════════════════════════════════

  static async listPlans(includeInactive = false) {
    await this.seedDefaultNepalPlans();
    const query: any = includeInactive ? {} : { isActive: true };
    return SubscriptionPlan.find(query).sort({ sortOrder: 1, createdAt: 1 });
  }

  static async getPlanById(planId: string) {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) throw new Error('Subscription plan not found');
    return plan;
  }

  static async createPlan(data: Partial<ISubscriptionPlan>) {
    if (!data.code || !data.name || !data.applicableGrades) {
      throw new Error('Code, name, and applicableGrades are required to create a plan');
    }

    // Default features if omitted
    const planData: any = {
      ...data,
      code: data.code.toUpperCase().trim(),
      features: {
        gradesCovered: data.applicableGrades,
        isTextbooksIncluded: true,
        isSimulationsIncluded: true,
        isActivitiesIncluded: true,
        isSmartBoardIncluded: true,
        isAiAssistantIncluded: true,
        isAcademicManagementIncluded: true,
        isAnalyticsIncluded: true,
        ...(data.features || {}),
      },
    };

    return SubscriptionPlan.create(planData);
  }

  static async updatePlan(planId: string, data: Partial<ISubscriptionPlan>) {
    const updated = await SubscriptionPlan.findByIdAndUpdate(
      planId,
      { $set: data },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) throw new Error('Subscription plan not found');
    return updated;
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. SUBSCRIPTIONS LIFECYCLE (ASSIGN, EXTEND, SUSPEND, ACTIVATE)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Assigns or updates an institution's subscription
   */
  static async assignSubscription(params: {
    institutionId: string;
    planId: string;
    durationMonths?: number;
    billingCycle?: 'ANNUAL' | 'MONTHLY' | 'CUSTOM';
    autoRenew?: boolean;
    customEntitlements?: any;
    assignedBy?: string;
    notes?: string;
  }) {
    const { institutionId, planId } = params;
    const durationMonths = params.durationMonths || (params.billingCycle === 'MONTHLY' ? 1 : 12);

    const [institution, plan] = await Promise.all([
      Institution.findById(institutionId),
      SubscriptionPlan.findById(planId),
    ]);

    if (!institution) throw new Error('Institution not found');
    if (!plan) throw new Error('Subscription plan not found');

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Official 15-day Grace Period after subscription expiration
    const gracePeriodEndDate = new Date(endDate);
    gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 15);

    const pricePaidNpr =
      params.billingCycle === 'MONTHLY'
        ? plan.pricing.monthlyPriceNpr || Math.round(plan.pricing.annualPriceNpr / 10)
        : plan.pricing.annualPriceNpr;

    // Create or update subscription
    const subscription = await InstitutionSubscription.create({
      institutionId,
      planId: plan._id,
      packageId: plan._id, // backward-compat
      planCode: plan.code,
      status: 'ACTIVE',
      startDate,
      endDate,
      gracePeriodEndDate,
      billingCycle: params.billingCycle || 'ANNUAL',
      pricePaidNpr,
      autoRenew: params.autoRenew || false,
      maxStudents: plan.limits?.maxStudents || 1000,
      maxTeachers: plan.limits?.maxTeachers || 100,
      maxSmartBoards: plan.limits?.maxSmartBoards || 10,
      customEntitlements: params.customEntitlements,
      assignedBy: params.assignedBy,
    });

    // Generate Invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const invoice = await Invoice.create({
      institutionId,
      subscriptionId: subscription._id,
      invoiceNumber,
      billingPeriodStart: startDate,
      billingPeriodEnd: endDate,
      issueDate: startDate,
      dueDate: new Date(Date.now() + 14 * 86400000), // 14 days payment window
      lineItems: [
        {
          description: `${plan.name} (${durationMonths} Months Subscription)`,
          gradeCoverage: `Classes ${plan.applicableGrades.join(', ')}`,
          quantity: 1,
          unitPriceNpr: pricePaidNpr,
          totalNpr: pricePaidNpr,
        },
      ],
      subtotalNpr: pricePaidNpr,
      taxPercent: 0, // Educational service exemption
      taxAmountNpr: 0,
      totalAmountNpr: pricePaidNpr,
      currency: 'NPR',
      status: 'ISSUED',
      notes: params.notes || `Subscription license for ${institution.name}`,
      generatedBy: params.assignedBy,
    });

    // Update resolved entitlements
    await this.refreshEntitlements(institutionId);

    // Audit log
    await SubscriptionHistory.create({
      institutionId,
      subscriptionId: subscription._id,
      action: 'CREATED',
      newStatus: 'ACTIVE',
      durationDaysAdded: durationMonths * 30,
      performedBy: params.assignedBy,
      reason: params.notes || `Plan ${plan.name} assigned`,
    });

    return { subscription, invoice };
  }

  /**
   * Extends subscription duration
   */
  static async extendSubscription(params: {
    subscriptionId: string;
    additionalMonths?: number;
    additionalDays?: number;
    reason?: string;
    performedBy?: string;
  }) {
    const sub = await InstitutionSubscription.findById(params.subscriptionId);
    if (!sub) throw new Error('Subscription not found');

    const previousStatus = sub.status;
    const currentEnd = sub.endDate > new Date() ? sub.endDate : new Date();
    const newEnd = new Date(currentEnd);
    if (params.additionalMonths && params.additionalMonths > 0) {
      newEnd.setMonth(newEnd.getMonth() + params.additionalMonths);
    }
    if (params.additionalDays && params.additionalDays > 0) {
      newEnd.setDate(newEnd.getDate() + params.additionalDays);
    }
    if (!params.additionalMonths && !params.additionalDays) {
      newEnd.setMonth(newEnd.getMonth() + 1); // default 1 month
    }

    const newGraceEnd = new Date(newEnd);
    newGraceEnd.setDate(newGraceEnd.getDate() + 15);

    sub.endDate = newEnd;
    sub.gracePeriodEndDate = newGraceEnd;
    sub.status = 'ACTIVE';
    await sub.save();

    await this.refreshEntitlements(sub.institutionId.toString());

    await SubscriptionHistory.create({
      institutionId: sub.institutionId,
      subscriptionId: sub._id,
      action: 'EXTENDED',
      previousStatus,
      newStatus: 'ACTIVE',
      durationDaysAdded: (params.additionalMonths || 0) * 30 + (params.additionalDays || 0),
      performedBy: params.performedBy,
      reason: params.reason || `Extended subscription by admin`,
    });

    return sub;
  }

  /**
   * Suspend institution subscription
   */
  static async suspendSubscription(params: {
    subscriptionId: string;
    reason: string;
    performedBy?: string;
  }) {
    const sub = await InstitutionSubscription.findById(params.subscriptionId);
    if (!sub) throw new Error('Subscription not found');

    const previousStatus = sub.status;
    sub.status = 'SUSPENDED';
    sub.suspendedReason = params.reason;
    await sub.save();

    await this.refreshEntitlements(sub.institutionId.toString());

    await SubscriptionHistory.create({
      institutionId: sub.institutionId,
      subscriptionId: sub._id,
      action: 'SUSPENDED',
      previousStatus,
      newStatus: 'SUSPENDED',
      performedBy: params.performedBy,
      reason: params.reason,
    });

    return sub;
  }

  /**
   * Activate or un-suspend subscription
   */
  static async activateSubscription(params: {
    subscriptionId: string;
    reason?: string;
    performedBy?: string;
  }) {
    const sub = await InstitutionSubscription.findById(params.subscriptionId);
    if (!sub) throw new Error('Subscription not found');

    const previousStatus = sub.status;
    sub.status = 'ACTIVE';
    sub.suspendedReason = undefined;
    await sub.save();

    await this.refreshEntitlements(sub.institutionId.toString());

    await SubscriptionHistory.create({
      institutionId: sub.institutionId,
      subscriptionId: sub._id,
      action: 'ACTIVATED',
      previousStatus,
      newStatus: 'ACTIVE',
      performedBy: params.performedBy,
      reason: params.reason || 'Reactivated by Super Admin',
    });

    return sub;
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. ENTITLEMENTS RESOLUTION & ACCESS CHECKS
  // ══════════════════════════════════════════════════════════════════

  /**
   * Refreshes and returns the active entitlements for an institution.
   * Handles Grace Period and Expiry state without deleting any student records.
   */
  static async refreshEntitlements(institutionId: string) {
    const activeSub = await InstitutionSubscription.findOne({
      institutionId,
      status: { $in: ['ACTIVE', 'GRACE_PERIOD', 'TRIAL', 'EXPIRED', 'SUSPENDED'] },
    })
      .sort({ endDate: -1 })
      .populate('planId');

    const now = new Date();
    let status: SubscriptionStatus = 'ACTIVE';
    let inGracePeriod = false;
    let isExpired = false;

    if (!activeSub) {
      status = 'EXPIRED';
      isExpired = true;
    } else if (activeSub.status === 'SUSPENDED') {
      status = 'SUSPENDED';
    } else if (now > activeSub.gracePeriodEndDate) {
      status = 'EXPIRED';
      isExpired = true;
      if (activeSub.status !== 'EXPIRED') {
        activeSub.status = 'EXPIRED';
        await activeSub.save();
      }
    } else if (now > activeSub.endDate) {
      status = 'GRACE_PERIOD';
      inGracePeriod = true;
      if (activeSub.status !== 'GRACE_PERIOD') {
        activeSub.status = 'GRACE_PERIOD';
        await activeSub.save();
      }
    } else {
      status = activeSub.status;
    }

    const plan = (activeSub?.planId as any) || null;
    let allowedGrades: number[] = [];

    if (plan && plan.applicableGrades) {
      allowedGrades = [...plan.applicableGrades];
    }
    // Apply custom overrides if any
    if (activeSub?.customEntitlements?.allowedGrades?.length) {
      allowedGrades = activeSub.customEntitlements.allowedGrades;
    }

    const daysRemaining = activeSub?.endDate
      ? Math.max(0, Math.ceil((activeSub.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    const entitlementDoc = await SubscriptionEntitlement.findOneAndUpdate(
      { institutionId },
      {
        institutionId,
        subscriptionId: activeSub?._id,
        allowedGrades,
        allowedModules: [
          'CURRICULUM',
          'TEXTBOOKS',
          'SIMULATIONS',
          'ACTIVITIES',
          'SMARTBOARD',
          'ACADEMIC',
          'AI_ASSISTANT',
          'ANALYTICS',
        ],
        isTextbooksEnabled: !isExpired,
        isSimulationsEnabled: !isExpired && (plan?.features?.isSimulationsIncluded ?? true),
        isActivitiesEnabled: !isExpired && (plan?.features?.isActivitiesIncluded ?? true),
        isSmartBoardEnabled: !isExpired && (plan?.features?.isSmartBoardIncluded ?? true),
        isAiAssistantEnabled: !isExpired && (plan?.features?.isAiAssistantIncluded ?? true),
        isAcademicManagementEnabled: true, // Always allowed to view historical records
        isAnalyticsEnabled: !isExpired && (plan?.features?.isAnalyticsIncluded ?? true),
        maxStudents: activeSub?.maxStudents || plan?.limits?.maxStudents || 1000,
        maxTeachers: activeSub?.maxTeachers || plan?.limits?.maxTeachers || 100,
        maxSmartBoards: activeSub?.maxSmartBoards || plan?.limits?.maxSmartBoards || 10,
        status,
        inGracePeriod,
        isExpired,
        daysRemaining,
        expiresAt: activeSub?.endDate,
      },
      { upsert: true, returnDocument: 'after' }
    );

    return entitlementDoc;
  }

  /**
   * Retrieves active entitlements for an institution (used by frontend and middleware)
   */
  static async getInstitutionEntitlements(institutionId: string) {
    const ent = await this.refreshEntitlements(institutionId);
    const sub = await InstitutionSubscription.findOne({ institutionId })
      .sort({ endDate: -1 })
      .populate('planId');

    return {
      institutionId,
      status: ent.status,
      hasActiveSubscription: ent.status === 'ACTIVE' || ent.inGracePeriod,
      inGracePeriod: ent.inGracePeriod,
      isExpired: ent.isExpired,
      daysRemaining: ent.daysRemaining,
      expiresAt: ent.expiresAt,
      allowedGrades: ent.allowedGrades,
      gradesCovered: ent.allowedGrades, // backward-compat alias
      hasSimulations: ent.isSimulationsEnabled,
      hasSmartBoard: ent.isSmartBoardEnabled,
      isAiAssistantEnabled: ent.isAiAssistantEnabled,
      isAnalyticsEnabled: ent.isAnalyticsEnabled,
      maxStudents: ent.maxStudents,
      maxTeachers: ent.maxTeachers,
      maxSmartBoards: ent.maxSmartBoards,
      currentPlan: sub?.planId || null,
      activeSubscription: sub,
    };
  }

  /**
   * Fast-path grade entitlement validator
   */
  static async isGradeEntitled(institutionId: string, gradeNumber: number): Promise<boolean> {
    const entitlements = await this.getInstitutionEntitlements(institutionId);
    if (entitlements.isExpired && !entitlements.inGracePeriod) {
      return false;
    }
    // If no grade constraints defined yet on subscription, grant standard access
    if (!entitlements.allowedGrades || entitlements.allowedGrades.length === 0) {
      return true;
    }
    return entitlements.allowedGrades.includes(gradeNumber);
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. INVOICES & BILLING
  // ══════════════════════════════════════════════════════════════════

  static async listInvoices(institutionId?: string, status?: string) {
    const query: any = {};
    if (institutionId) query.institutionId = new mongoose.Types.ObjectId(institutionId);
    if (status) query.status = status;

    return Invoice.find(query)
      .populate('institutionId', 'name emisCode province district')
      .populate('subscriptionId')
      .sort({ issueDate: -1 });
  }

  static async getInvoiceById(invoiceId: string) {
    const invoice = await Invoice.findById(invoiceId)
      .populate('institutionId', 'name emisCode address province district phone email')
      .populate('subscriptionId');
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  // ══════════════════════════════════════════════════════════════════
  // 6. PAYMENT INITIATION & BACKEND VERIFICATION
  // ══════════════════════════════════════════════════════════════════

  /**
   * Initiates payment for an invoice with Khalti, eSewa, or Bank Transfer
   */
  static async initiatePayment(params: {
    invoiceId: string;
    gateway: PaymentGatewayType;
    returnUrl?: string;
    customerEmail?: string;
    customerPhone?: string;
  }) {
    const invoice = await Invoice.findById(params.invoiceId).populate('institutionId');
    if (!invoice) throw new Error('Invoice not found');
    if (invoice.status === 'PAID') throw new Error('This invoice is already paid');

    const paymentReference = `PAY-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const gateway = PaymentGatewayFactory.getGateway(params.gateway);

    const initResult = await gateway.initiatePayment({
      invoiceId: invoice._id.toString(),
      amountNpr: invoice.totalAmountNpr,
      paymentReference,
      institutionName: (invoice.institutionId as any)?.name || 'Nepal School',
      customerEmail: params.customerEmail || (invoice.institutionId as any)?.email,
      customerPhone: params.customerPhone || (invoice.institutionId as any)?.phone,
      returnUrl: params.returnUrl,
    });

    const payment = await Payment.create({
      invoiceId: invoice._id,
      institutionId: invoice.institutionId,
      subscriptionId: invoice.subscriptionId,
      paymentReference,
      gateway: params.gateway,
      amountNpr: invoice.totalAmountNpr,
      currency: 'NPR',
      status: 'INITIATED',
      gatewayTransactionId: initResult.pidx,
      gatewayCallbackPayload: initResult.additionalData,
    });

    return {
      payment,
      initResult,
    };
  }

  /**
   * Verifies payment callback securely on backend (never trust frontend keys)
   */
  static async verifyPayment(params: {
    paymentReference: string;
    gatewayTransactionId?: string;
    pidx?: string;
    token?: string;
    callbackPayload?: any;
    verifiedBy?: string;
  }) {
    const payment = await Payment.findOne({ paymentReference: params.paymentReference });
    if (!payment) throw new Error('Payment transaction not found');

    const gateway = PaymentGatewayFactory.getGateway(payment.gateway);
    const verifyResult = await gateway.verifyPayment({
      paymentReference: payment.paymentReference,
      gatewayTransactionId: params.gatewayTransactionId,
      pidx: params.pidx || payment.gatewayTransactionId,
      token: params.token,
      amountNpr: payment.amountNpr,
      callbackPayload: params.callbackPayload,
    });

    if (verifyResult.isSuccess) {
      payment.status = 'COMPLETED';
      payment.gatewayTransactionId = verifyResult.gatewayTransactionId;
      payment.completedAt = new Date();
      payment.verifiedBy = params.verifiedBy ? new mongoose.Types.ObjectId(params.verifiedBy) : undefined;
      payment.gatewayCallbackPayload = verifyResult.rawResponse;
      await payment.save();

      // Mark Invoice as PAID
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        invoice.status = 'PAID';
        invoice.paidDate = new Date();
        await invoice.save();
      }

      // Activate or Extend associated Subscription
      if (payment.subscriptionId) {
        const sub = await InstitutionSubscription.findById(payment.subscriptionId);
        if (sub) {
          sub.status = 'ACTIVE';
          await sub.save();
          await this.refreshEntitlements(sub.institutionId.toString());

          await SubscriptionHistory.create({
            institutionId: sub.institutionId,
            subscriptionId: sub._id,
            action: 'RENEWED',
            newStatus: 'ACTIVE',
            performedBy: params.verifiedBy,
            reason: `Payment verified via ${payment.gateway} (${payment.paymentReference})`,
          });
        }
      }

      return { isSuccess: true, payment };
    } else {
      payment.status = 'FAILED';
      await payment.save();
      return { isSuccess: false, payment };
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 7. EXPIRY HANDLING & RENEWAL REMINDERS
  // ══════════════════════════════════════════════════════════════════

  /**
   * Monitor renewals: lists upcoming expirations and active grace periods
   */
  static async getRenewalDashboard() {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [upcomingExpirations, inGracePeriod, expiredCount, activeCount] = await Promise.all([
      InstitutionSubscription.find({
        status: 'ACTIVE',
        endDate: { $gte: now, $lte: thirtyDaysFromNow },
      })
        .populate('institutionId', 'name emisCode province district')
        .populate('planId', 'name code applicableGrades')
        .sort({ endDate: 1 }),

      InstitutionSubscription.find({ status: 'GRACE_PERIOD' })
        .populate('institutionId', 'name emisCode province district')
        .populate('planId', 'name code applicableGrades')
        .sort({ gracePeriodEndDate: 1 }),

      InstitutionSubscription.countDocuments({ status: 'EXPIRED' }),
      InstitutionSubscription.countDocuments({ status: 'ACTIVE' }),
    ]);

    return {
      activeCount,
      expiredCount,
      gracePeriodCount: inGracePeriod.length,
      upcomingRenewalsCount: upcomingExpirations.length,
      upcomingExpirations,
      inGracePeriod,
    };
  }

  /**
   * Subscription change audit history
   */
  static async getSubscriptionHistory(institutionId?: string) {
    const query = institutionId ? { institutionId: new mongoose.Types.ObjectId(institutionId) } : {};
    return SubscriptionHistory.find(query)
      .populate('institutionId', 'name emisCode')
      .populate('performedBy', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(50);
  }

  // ══════════════════════════════════════════════════════════════════
  // BACKWARD COMPATIBILITY ALIASES
  // ══════════════════════════════════════════════════════════════════
  static async listPackages() {
    return this.listPlans();
  }

  static async assign(data: {
    institutionId: string;
    packageId: string;
    durationMonths?: number;
    maxStudents?: number;
    maxTeachers?: number;
  }) {
    const res = await this.assignSubscription({
      institutionId: data.institutionId,
      planId: data.packageId,
      durationMonths: data.durationMonths,
    });
    return res.subscription;
  }
}
