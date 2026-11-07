async function testEdit() {
  const loginRes = await fetch('http://localhost:5000/api/auth/demo-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'SUPER_ADMIN' }),
  });
  const loginData: any = await loginRes.json();
  const token = loginData.data?.token || loginData.token;

  // 1. Get list
  const listRes = await fetch('http://localhost:5000/api/admin/registration-requests?status=PENDING', {
    headers: { Authorization: 'Bearer ' + token },
  });
  const listData: any = await listRes.json();
  const firstReq = listData.data?.requests?.[0];
  console.log('Target Request to Edit:', firstReq?.requestCode, firstReq?.institutionName);

  if (firstReq) {
    const targetId = firstReq.id || firstReq._id;
    const updateRes = await fetch(`http://localhost:5000/api/admin/registration-requests/${targetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        institutionName: firstReq.institutionName,
        estimatedStudents: 850,
        notes: 'Verified by MoEST Federal Accreditation Board (Edited by Super Admin)',
      }),
    });
    const updateData: any = await updateRes.json();
    console.log('Update Result HTTP:', updateRes.status, 'Estimated Students:', updateData.data?.estimatedStudents, 'Notes:', updateData.data?.notes);
  }
}

testEdit();

