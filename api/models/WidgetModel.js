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
                  aps.AppointmentStatusId,
                  aps.Name, 
                  aps.ConfirmMessage,
                  aps.Label
                FROM appointmentstatus as aps
                ORDER BY aps.Name ASC
                `;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getAppointmentStatusNotes: async (AppointmentStatusId = null) => {
    if(!AppointmentStatusId || AppointmentStatusId < 1) return [];

    const sql = `SELECT * FROM appointmentstatusnote WHERE AppointmentStatusId = ${AppointmentStatusId}`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    
    return result;
  },

  getAppointmentTypes: async () => {
    const sql = `SELECT 
                  AppointmentLabelId,
                  Name
                FROM appointmentlabel 
                ORDER BY Name ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getBranchs: async () => {
    const sql = `SELECT 
                  BranchId,
                  BranchCode,
                  Name
                FROM branch 
                ORDER BY Name ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getDoctors: async () => {
    const sql = `SELECT 
                  d.DoctorId,
                  s.StaffId,
                  s.FullName,
                  s.Photo,
                  s.GenderId as Gender
                FROM doctor as d
                LEFT JOIN staff as s ON s.StaffId = d.StaffId
                ORDER BY s.FullName ASC`;
    const executeDoctor = await sails.sendNativeQuery(sql);
    const doctors = executeDoctor.rows || [];

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
                  StaffId,
                  FullName,
                  Photo,
                  GenderId as Gender
                FROM staff
                WHERE StaffId IN (${whereIn})`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getCustomerTypes: async () => {
    const sql = `SELECT CustomerTypeId, Name FROM customertype WHERE State=1`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getStaffsByIds: async (staffIds) => {
    if(staffIds.length === 0) return [];
    const whereIn = staffIds.join();
    const sql = `SELECT
                  StaffId,
                  FullName,
                  Photo,
                  GenderId as Gender
                FROM staff
                WHERE StaffId IN (${whereIn})`;
    const executeStaff = await sails.sendNativeQuery(sql);
    const staffs = executeStaff.rows || [];
    staffs.length !== 0 && staffs.map(staff => {
      const { StaffId, Photo, Gender } = staff;
      staff.Photo = WidgetModel.getStaffPhotoUrl({StaffId, Photo, Gender});
      return staff;
    }); 
    return staffs;
  },

  getProvinces: async () => {
    const sql = `SELECT 
                  VnProvinceId,
                  NameVi,
                  LabelVi
                FROM vnprovince
                ORDER BY Ordering ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getProvincesByIds: async (ProvinceIds = []) => {
    if(!ProvinceIds || ProvinceIds.length === 0 ) return [];
    const whereIn = ProvinceIds.join();
    const sql = `SELECT 
                  VnProvinceId,
                  NameVi,
                  LabelVi
                FROM vnprovince
                WHERE VnProvinceId IN (${whereIn})
                ORDER BY Ordering ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || null;
    return result;
  },

  getDistrictsByProvinceId: async (VnProvinceId=1) => {
    const sql = `SELECT 
                  VnDistrictId,
                  VnProvinceId,
                  NameVi,
                  LabelVi
                FROM vndistrict
                WHERE VnProvinceId=${VnProvinceId}
                ORDER BY Ordering ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getDistrictsByIds: async (DistrictIds = null) => {
    if(!DistrictIds || DistrictIds.length === 0) return [];
    const whereIn = DistrictIds.join();
    const sql = `SELECT 
                  VnDistrictId,
                  VnProvinceId,
                  NameVi,
                  LabelVi
                FROM vndistrict
                WHERE VnDistrictId IN (${whereIn})
                ORDER BY Ordering ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getWardsByDistrictId: async (VnDistrictId=1) => {
    const sql = `SELECT 
                  VnDistrictId,
                  VnWardId,
                  NameVi,
                  LabelVi
                FROM vnward
                WHERE VnDistrictId=${VnDistrictId}
                ORDER BY Ordering ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getWardsByIds: async (WardIds = null) => {
    if(!WardIds || WardIds.length === 0) return [];
    const whereIn = WardIds.join();
    const sql = `SELECT 
                  VnDistrictId,
                  VnWardId,
                  NameVi,
                  LabelVi
                FROM vnward
                WHERE VnWardId IN(${whereIn})
                ORDER BY Ordering ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
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