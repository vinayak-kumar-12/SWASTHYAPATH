const { query } = require("../config/database");

const createPatient = async (data) => {
  const sql = `
    INSERT INTO patient.patients (
      user_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      preferred_language,
      address_line1,
      address_line2,
      city,
      state,
      country,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
      profile_image_url,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING
      patient_id AS "patientId",
      user_id AS "userId",
      first_name AS "firstName",
      last_name AS "lastName",
      date_of_birth AS "dateOfBirth",
      gender,
      phone,
      email,
      preferred_language AS "preferredLanguage",
      address_line1 AS "addressLine1",
      address_line2 AS "addressLine2",
      city,
      state,
      country,
      postal_code AS "postalCode",
      emergency_contact_name AS "emergencyContactName",
      emergency_contact_phone AS "emergencyContactPhone",
      profile_image_url AS "profileImageUrl",
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const values = [
    data.user_id,
    data.first_name,
    data.last_name || null,
    data.date_of_birth || null,
    data.gender || null,
    data.phone || null,
    data.email || null,
    data.preferred_language || null,
    data.address_line1 || null,
    data.address_line2 || null,
    data.city || null,
    data.state || null,
    data.country || null,
    data.postal_code || null,
    data.emergency_contact_name || null,
    data.emergency_contact_phone || null,
    data.profile_image_url || null,
    data.status || "ACTIVE",
  ];

  const res = await query(sql, values);
  return res.rows[0];
};

const findPatientByUserId = async (userId) => {
  const sql = `
    SELECT
      patient_id AS "patientId",
      user_id AS "userId",
      first_name AS "firstName",
      last_name AS "lastName",
      date_of_birth AS "dateOfBirth",
      gender,
      phone,
      email,
      preferred_language AS "preferredLanguage",
      address_line1 AS "addressLine1",
      address_line2 AS "addressLine2",
      city,
      state,
      country,
      postal_code AS "postalCode",
      emergency_contact_name AS "emergencyContactName",
      emergency_contact_phone AS "emergencyContactPhone",
      profile_image_url AS "profileImageUrl",
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM patient.patients
    WHERE user_id = $1 AND status != 'DELETED';
  `;

  const res = await query(sql, [userId]);
  return res.rows[0] || null;
};

const findPatientById = async (patientId) => {
  const sql = `
    SELECT
      patient_id AS "patientId",
      user_id AS "userId",
      first_name AS "firstName",
      last_name AS "lastName",
      date_of_birth AS "dateOfBirth",
      gender,
      phone,
      email,
      preferred_language AS "preferredLanguage",
      address_line1 AS "addressLine1",
      address_line2 AS "addressLine2",
      city,
      state,
      country,
      postal_code AS "postalCode",
      emergency_contact_name AS "emergencyContactName",
      emergency_contact_phone AS "emergencyContactPhone",
      profile_image_url AS "profileImageUrl",
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM patient.patients
    WHERE patient_id = $1 AND status != 'DELETED';
  `;

  const res = await query(sql, [patientId]);
  return res.rows[0] || null;
};

const existsByUserId = async (userId) => {
  const sql = `SELECT 1 FROM patient.patients WHERE user_id = $1 AND status != 'DELETED';`;
  const res = await query(sql, [userId]);
  return res.rowCount > 0;
};

const updatePatient = async (patientId, data) => {
  const fieldMappings = {
    first_name: "first_name",
    last_name: "last_name",
    date_of_birth: "date_of_birth",
    gender: "gender",
    phone: "phone",
    email: "email",
    preferred_language: "preferred_language",
    address_line1: "address_line1",
    address_line2: "address_line2",
    city: "city",
    state: "state",
    country: "country",
    postal_code: "postal_code",
    emergency_contact_name: "emergency_contact_name",
    emergency_contact_phone: "emergency_contact_phone",
    profile_image_url: "profile_image_url",
  };

  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, dbColumn] of Object.entries(fieldMappings)) {
    if (data[key] !== undefined) {
      updates.push(`${dbColumn} = $${paramIndex}`);
      values.push(data[key]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return findPatientById(patientId);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(patientId);

  const sql = `
    UPDATE patient.patients
    SET ${updates.join(", ")}
    WHERE patient_id = $${paramIndex} AND status != 'DELETED'
    RETURNING
      patient_id AS "patientId",
      user_id AS "userId",
      first_name AS "firstName",
      last_name AS "lastName",
      date_of_birth AS "dateOfBirth",
      gender,
      phone,
      email,
      preferred_language AS "preferredLanguage",
      address_line1 AS "addressLine1",
      address_line2 AS "addressLine2",
      city,
      state,
      country,
      postal_code AS "postalCode",
      emergency_contact_name AS "emergencyContactName",
      emergency_contact_phone AS "emergencyContactPhone",
      profile_image_url AS "profileImageUrl",
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const res = await query(sql, values);
  return res.rows[0] || null;
};

const softDeletePatient = async (patientId) => {
  const sql = `
    UPDATE patient.patients
    SET status = 'DELETED', updated_at = CURRENT_TIMESTAMP
    WHERE patient_id = $1 AND status != 'DELETED'
    RETURNING
      patient_id AS "patientId",
      user_id AS "userId",
      status,
      updated_at AS "updatedAt";
  `;

  const res = await query(sql, [patientId]);
  return res.rows[0] || null;
};

module.exports = {
  createPatient,
  findPatientByUserId,
  findPatientById,
  existsByUserId,
  updatePatient,
  softDeletePatient,
};
