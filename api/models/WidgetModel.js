/**
 * WidgetModel.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const fs = require('fs');
const appPath = sails.config.appPath;
const baseUrl = sails.config.custom.baseUrl;

module.exports = {
  getAppointmentStatus: async () => {
    const sql = `SELECT 
                  "aps"."AppointmentStatusId",
                  "aps"."Name", 
                  "aps"."ConfirmMessage",
                  "aps"."Label"
                FROM "public"."AppointmentStatus" as "aps"
                ORDER BY "aps"."Name" ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || null;
    return result;
  },

  getAppointmentTypes: async () => {
    const sql = `SELECT 
                  "AppointmentLabelId",
                  "Name"
                FROM "public"."AppointmentLabel" 
                ORDER BY "Name" ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || null;
    return result;
  },

  getBranchs: async () => {
    const sql = `SELECT 
                  "BranchId",
                  "BranchCode",
                  "Name"
                FROM "public"."Branch" 
                ORDER BY "Name" ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || null;
    return result;
  },

  getDoctors: async () => {
    const sql = `SELECT 
                  "d"."DoctorId",
                  "s"."StaffId",
                  "s"."FullName",
                  "s"."Photo",
                  "s"."Gender"
                FROM "public"."Doctor" as "d"
                LEFT JOIN "public"."Staff" as "s" ON "s"."StaffId" = "d"."StaffId"
                ORDER BY "s"."FullName" ASC`;
    const executeDoctor = await sails.sendNativeQuery(sql);
    const doctors = executeDoctor.rows || null;

    doctors.length !== 0 && doctors.map(doctor => {
      const { 
        Gender, 
        Photo,
        StaffId
      } = doctor;

      doctor.Photo = WidgetModel.getStaffPhotoUrl({
        Gender,
        Photo,
        StaffId
      });
      
      return doctor;
    });

    return doctors;
  },

  getStaffsByIds: async (staffIds) => {
    if(staffIds.length === 0) return [];
    const whereIn = staffIds.join();
    const sql = `SELECT
                  "StaffId",
                  "FullName",
                  "Photo",
                  "Gender"
                FROM "public"."Staff"
                WHERE "StaffId" IN (${whereIn})`;
    const executeStaff = await sails.sendNativeQuery(sql);
    const staffs = executeStaff.rows || null;
    staffs.length !== 0 && staffs.map(staff => {
      const { StaffId, Photo, Gender } = staff;
      staff.Photo = WidgetModel.getStaffPhotoUrl({StaffId, Photo, Gender});
      return staff;
    }); 
    return staffs;
  },

  getStaffPhotoUrl: ({ 
    StaffId,
    Photo,
    Gender 
  }) => {
    let photo = (Gender === 2) ? require('util').format('%s/images/modules/staff/avatar-girl.jpg', baseUrl) : require('util').format('%s/images/modules/staff/avatar-boy.jpg', baseUrl);
    if(Photo && Photo != 'NULL') {
      const imagePath = `${appPath}\\assets\\images\\modules\\staff\\${StaffId}\\${Photo}`;
      if(fs.existsSync(imagePath)) photo = require('util').format('%s/images/modules/staff/%s/%s', baseUrl, StaffId, doctorPhoto);
    }
    return photo;
  }
};