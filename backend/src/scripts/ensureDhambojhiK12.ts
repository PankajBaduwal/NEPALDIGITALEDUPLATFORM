import { connectDB, disconnectDB } from '../config/db';
import { Institution, SubscriptionPlan, InstitutionSubscription, SubscriptionEntitlement } from '../models';
import { SubscriptionsService } from '../modules/subscriptions/subscriptions.service';

async function main() {
  await connectDB();
  const inst = (await Institution.findOne({ email: 'info@dhambojhi.edu.np.test' })) || (await Institution.findOne({ name: /Dhambojhi/i }));
  if (!inst) {
    console.log('Dhambojhi not found');
    await disconnectDB();
    return;
  }
  console.log('[Setup] Found Dhambojhi:', inst.name, inst._id.toString());

  let plan = await SubscriptionPlan.findOne({ code: 'K12_ALL' });
  if (!plan) {
    plan = await SubscriptionPlan.create({
      code: 'K12_ALL',
      name: 'K-12 Comprehensive National Digital Access',
      nameNepali: 'कक्षा १-१२ राष्ट्रिय डिजिटल शिक्षा',
      description: 'Complete digital access for Classes 1 to 12 across Nepal CDC curriculum.',
      tier: 'SECONDARY',
      billingCycle: 'ANNUAL',
      priceNPR: 0,
      applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      features: {
        isSmartBoardIncluded: true,
        isTextbooksIncluded: true,
        isSimulationsIncluded: true,
        isAiAssistantIncluded: true,
        isOfflineModeIncluded: true,
        isExaminationIncluded: true,
        isAnalyticsIncluded: true,
      },
      limits: {
        maxStudents: 5000,
        maxTeachers: 200,
        maxSmartBoards: 50,
      },
      isActive: true,
    });
  }

  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 2);

  await InstitutionSubscription.findOneAndUpdate(
    { institutionId: inst._id },
    {
      institutionId: inst._id,
      planId: plan._id,
      packageId: plan._id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: oneYearLater,
      gracePeriodEndDate: oneYearLater,
      maxStudents: 5000,
      maxTeachers: 200,
      maxSmartBoards: 50,
      allowedGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      isTextbooksIncluded: true,
    },
    { upsert: true }
  );

  await SubscriptionsService.refreshEntitlements(inst._id.toString());
  console.log('[Setup] Refreshed entitlements for Dhambojhi!');

  for (let g = 1; g <= 12; g++) {
    const entitled = await SubscriptionsService.isGradeEntitled(inst._id.toString(), g);
    console.log(`Grade ${g} entitled:`, entitled);
  }

  await disconnectDB();
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDB();
  process.exit(1);
});

