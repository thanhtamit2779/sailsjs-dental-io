/**
 * PatientModel.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const fs = require('fs');
const appPath = sails.config.appPath;
const baseUrl = sails.config.custom.baseUrl;

module.exports = {
  tableName: 'Patient',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      columnName: 'PatientId'
    },
    FullName: {
      type: 'string',
      allowNull: false
    },
    Gender: {
      type: 'number',
    },
    Birthday: {
      type: 'ref',
      columnType: 'datetime'
    },
    Address: {
      type: 'string',
      allowNull: true    
    },
    Photo: {
      type: 'string'
    },
    Note: {
      type: 'string',
      allowNull: true    
    },
    CreatedAt: {
      type: 'ref',
      columnType: 'timestamp' 
    },
    CreatedBy: {
      type: 'number',
      allowNull: false    
    },
    UpdatedAt: {
      type: 'ref',
      columnType: 'timestamp'   
    },
    UpdatedBy: {
      type: 'number',
      allowNull: false    
    },
    LastActive: {
      type: 'ref',
      columnType: 'timestamp'   
    },
    State: {
      type: 'number',
      allowNull: false,
      defaultsTo: 1    
    },
    PatientCode: {
      type: 'string',
      allowNull: false    
    },
    PercentProfile: {
      type: 'number',
      allowNull: true    
    }
    
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

  getPatients: async (request) => {
    let { 
      Keyword = '',
      Page = 1,
      PerPage = 10,
      State = 1 
    } = request;

    const perPage = parseInt(PerPage);
    const page = parseInt(Page);
    const Offset = (parseInt(page) - 1) * parseInt(perPage);

    const sqlTotal =  `SELECT "c"."PatientId" as "TotalPatient"`;
    const sqlSelect = `SELECT 
                        "c"."PatientId", 
                        "c"."FullName", 
                        "c"."Gender", 
                        "c"."Birthday", 
                        "c"."State",       
                        "c"."Photo", 
                        "c"."PatientCode", 
                        "c"."Note",
                        "c"."Address",
                        "c"."UpdatedAt",
                        "c"."UpdatedBy",
                        (SELECT COUNT("AppointmentId") FROM "public"."Appointment" as "a" WHERE "a"."PatientId" = "c"."PatientId")::integer AS "TotalAppointment"`;
    let sql = `FROM "public"."Patient" as "c" WHERE 1 = 1`;

    if(Keyword.length > 2) {
      // Search By
      // 1. FullName
      // 2. PatientCode
      // 3. PhoneNumber
      let searchBy = 1;
      if(Keyword.substr(0, 2) === 'NK') {
        searchBy = 2;
      }
      else if(Number.isInteger(parseInt(Keyword))) {
        searchBy = 3;
      }

      switch(searchBy) {
        case 2:
          sql += ` AND "c"."PatientCode" LIKE '%${Keyword}%'`;
          break;

        case 3:
          sql += ` AND "c"."PatientId" IN (SELECT "PatientId" FROM "public"."PatientPhoneNumber" WHERE "PhoneNumber" LIKE '%${Keyword}%')`;
          break;

        default:
          sql += ` AND "c"."FullName" LIKE '%${Keyword}%'`;
          break;
      }
    }

    if(State >= 0) {
      sql += ` AND "c"."State"=${State}`;
    }
    
    sql += ` ORDER BY "c"."PatientId" DESC`;

    const sqlTotalQuery = `${sqlTotal} ${sql}`;
    const sqlQuery = `${sqlSelect} ${sql} LIMIT ${perPage} OFFSET ${Offset}`;
    const execute = await sails.sendNativeQuery(sqlQuery);
    const patients = execute.rows || null;
    if(patients.length === 0) return null;

    const executeTotal = await sails.sendNativeQuery(sqlTotalQuery);
    const totalPatient = executeTotal.rows || null;
    const Total = totalPatient.length || 0;

    const patientIds = [];
    let staffIds = [];
    patients.map(v => {
      const { 
        PatientId,
        UpdatedBy = null
      } = v;
      patientIds.push(PatientId);
      if(UpdatedBy && UpdatedBy > 0) staffIds.push(UpdatedBy);
      return v;
    });
    staffIds = [...new Set(staffIds)];

    const patientPhones = await PatientModel.getPhonesByPatientIds(patientIds);
    const patientEmails = await PatientModel.getEmailsByPatientIds(patientIds);
    const staffs = await WidgetModel.getStaffsByIds(staffIds);
    
    patients.map(v => {
      const { 
        PatientId,
        Gender,
        Photo,
        UpdatedBy = null
      } = v;
      v.Photo = PatientModel.getPhotoUrl({ PatientId, Gender, Photo });
      v.PatientPhoneNumber = patientPhones.filter(v => v.PatientId === PatientId) || null;
      v.PatientEmail = patientEmails.filter(v => v.PatientId === PatientId) || null;
      v.EditBy = staffs.find(v => v.StaffId === UpdatedBy) || null;
      return v;
    });

    return {
      Patients: patients,
      Pagination: {
        Total,
        TotalPage: Math.ceil(Total/perPage),
        Page: page,
        PerPage: perPage
      }
    };
  },

  getPatient: async (PatientId) => {
    if(!PatientId) return null;

    const patient = await PatientModel.findOne({
      where: { id: PatientId }
    });
    if(!patient && !patient.id) return null;

    patient.PatientId = patient.id;
    delete patient.id;

    const { 
      Gender,
      Photo
    } = patient;
    
    patient.Photo = PatientModel.getPhotoUrl({ Gender, Photo, PatientId });
    patient.PatientPhoneNumber = await PatientModel.getPhonesByPatientIds([PatientId]);
    patient.PatientEmail = await PatientModel.getEmailsByPatientIds([PatientId]);
    return patient;
  },

  getPatientProfile: async (PatientId) => {
    if(!PatientId) return null;

    const Patient = await PatientModel.getPatient(PatientId);
    const Appointments = await PatientModel.getAppointmentsByPatientId(PatientId);

    return {
      Patient,
      Appointments
    }
  },

  getAppointmentsByPatientId: async (PatientId = null) => {
    if(!PatientId) return [];

    const appointments = await AppointmentModel.find({
      where: { PatientId },
      select: [
        'StartAt', 
        'EndAt', 
        'Note', 
        'PatientId', 
        'AppointmentLabelId', 
        'CreatedAt',
        'CreatedBy',
        'EditedAt',
        'EditedBy',
        'DoctorId',
        'BranchId',
        'AppointmentStatusId'
      ]}).sort([{ StartAt: 'DESC' }]);
    
    let staffIds = [];
    let branchIds = [];
    let doctorIds = [];
    appointments.length !== 0 && appointments.map(v => {
      const { 
        EditedBy,
        CreatedBy,
        DoctorId,
        BranchId,
        id
      } = v;

      if(EditedBy > 0) staffIds.push(EditedBy);
      if(CreatedBy > 0) staffIds.push(CreatedBy);
      if(DoctorId > 0) doctorIds.push(DoctorId);
      if(BranchId > 0) branchIds.push(BranchId);

      v.AppointmentId = id;
      delete v.id;
      return v;
    });

    staffIds = [ ... new Set(staffIds) ];
    branchIds = [ ... new Set(branchIds) ];
    doctorIds = [ ... new Set(doctorIds) ];
    const staffs = await WidgetModel.getStaffsByIds(staffIds);
    const doctors = await AppointmentModel.getDoctorsByIds(doctorIds);
    const branchs = await AppointmentModel.getBranchsByIds(branchIds);
    const appointmentStatus = await WidgetModel.getAppointmentStatus();
    const appointmentTypes = await WidgetModel.getAppointmentTypes();

    appointments.length !== 0 && appointments.map(v => {
      const { 
        EditedBy,
        CreatedBy,
        DoctorId,
        BranchId,
        AppointmentLabelId,
        AppointmentStatusId
      } = v;

      v.Editor = staffs.find(v => v.StaffId === EditedBy) || null;
      v.Creator = staffs.find(v => v.StaffId === CreatedBy) || null;
      v.Doctor = doctors.find(v => v.DoctorId == DoctorId) || null;
      v.Branch = branchs.find(v => v.BranchId == BranchId) || null;
      v.AppointmentType = appointmentTypes.find(v => v.AppointmentLabelId == AppointmentLabelId) || null;
      v.AppointmentStatus = appointmentStatus.find(aps => aps.AppointmentStatusId == AppointmentStatusId) || null;

      return v;
    });
    
    return appointments;
  },

  getPhonesByPatientIds: async (patientIds = []) => {
    if(patientIds.length === 0) return null;

    const whereIn = patientIds.join();
    const sql = `SELECT "PhoneNumber", "PatientId" FROM "public"."PatientPhoneNumber" WHERE "PatientId" IN (${whereIn})`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || null;
    return result;
  },

  getEmailsByPatientIds: async (patientIds = []) => {
    if(patientIds.length === 0) return null;

    const whereIn = patientIds.join();
    const sql = `SELECT * FROM "public"."PatientEmail" WHERE "PatientId" IN (${whereIn})`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || null;
    return result;
  },

  checkPhone: async (request) => {
    const { PhoneNumber = null } = request;
    if(!PhoneNumber) return {
      Code: false,
      PhoneNumber,
      Notify: [{
        Message: 'Vui lòng nhập số điện thoại!',
        Code: false
      }]
    };

    const sql = `SELECT "PhoneNumber" 
                 FROM "public"."PatientPhoneNumber"
                 WHERE "PhoneNumber"='${PhoneNumber}'`;
    const execute = await sails.sendNativeQuery(sql);
    const phone = execute.rows || null;

    if(phone && phone.length !== 0) {
      return {
        Code: false,
        PhoneNumber,
        Notify: [{
          Message: `Số điện thoại ${PhoneNumber} đã có người sử dụng!`,
          Code: false
        }]
      };
    }

    return {
      Code: true,
      PhoneNumber,
      Notify: [{
        Message: `Số điện thoại ${PhoneNumber} hợp lệ!`,
        Code: true
      }]
    };
  },

  checkEmail: async (request) => {
    const { Email = null } = request;
    if(!Email) return {
      Code: false,
      Email,
      Notify: [{
        Message: 'Vui lòng nhập địa chỉ email!',
        Code: false
      }]
    };

    const sql = `SELECT "Email" 
                 FROM "public"."PatientEmail" 
                 WHERE "public"."Email"='${Email}'`;
    const execute = await sails.sendNativeQuery(sql);
    const email = execute.rows || null;

    if(email && email.length !== 0) {
      return {
        Code: false,
        Email,
        Notify: [{
          Message: `Địa chỉ email ${Email} đã tồn tại trên hệ thống!`,
          Code: false
        }]
      }
    }

    return {
      Code: true,
      Email,
      Notify: [{
        Message: `Địa chỉ email ${Email} hợp lệ!`,
        Code: true
      }]
    }
  },

  savePhone: async (PhoneNumber = null, PatientId = null) => {
    if(!PhoneNumber && !PatientId) return {
      Code: false,
      Message: 'Cập nhật số điện thoại không thành công!',
      Notify: [{
        Code: false,
        Message: 'Cập nhật số điện thoại không thành công!',
      }]
    };

    const date = new Date();
    const time = date.getTime();
    const ExpiredAt = ~~(time/1000);
    const AddedAt = ExpiredAt;

    const phoneExecute = await sails.sendNativeQuery(`SELECT "PhoneNumber" 
                                                            FROM "public"."PatientPhoneNumber"
                                                            WHERE "PhoneNumber" = '${PhoneNumber}' AND PatientId = ${PatientId}`);
    const phone = phoneExecute.rows || null;
    let isSave = 0;
    if(phone.length !== 0) {
      // Cập nhật tất cả số điện thoại hết hạn
      await sails.sendNativeQuery(`UPDATE PatientPhoneNumber 
                                  SET ExpiredAt=${ExpiredAt} 
                                  WHERE PatientId = ${PatientId} AND PhoneNumber != '${PhoneNumber}'`);

      // Active
      const execute = await sails.sendNativeQuery(`UPDATE "public"."PatientPhoneNumber"
                                                        SET ExpiredAt=0
                                                        WHERE "PatientId" = ${PatientId} AND PhoneNumber = '${PhoneNumber}'`);
      isSave = execute.affectedRows || 0;
    } 
    else {
      // Kiểm tra số điện thoại
      const checkPhone = await PatientModel.checkPhone({ PhoneNumber });
      if(!checkPhone.Code) return {
        Code: false,
        Notify: checkPhone.Notify
      };

      const sql = `INSERT INTO PatientPhoneNumber(PhoneNumber, PatientId, AddedAt, ExpiredAt) VALUES ('${PhoneNumber}', '${PatientId}', '${AddedAt}', '0')`;
      const execute = await sails.sendNativeQuery(sql);
      isSave = execute.affectedRows || 0;
    }    
    
    return isSave == 0 ? {
      Code: false,
      Message: 'Cập nhật số điện thoại không thành công!',
      Notify: [{
        Code: false,
        Message: 'Cập nhật số điện thoại không thành công!',
      }]
    } : {
      Code: true,
      Message: 'Cập nhật số điện thoại thành công!',
      Notify: [{
        Code: true,
        Message: 'Cập nhật số điện thoại thành công!',
      }]
    };
  },

  saveEmail: async (Email = null, PatientId = null) => {
    if(!Email && !PatientId) return {
      Code: false,
      Message: 'Cập nhật địa chỉ email không thành công!',
      Notify: [{
        Code: false,
        Message: 'Cập nhật địa chỉ email không thành công!',
      }]
    };;
    const date = new Date();
    const time = date.getTime();
    const AddedAt = ~~(time/1000);

    const emailExecute = await sails.sendNativeQuery(`SELECT Email 
                                                      FROM "public"."PatientEmail"
                                                      WHERE Email = '${Email}' AND PatientId = ${PatientId}`);
    const email = emailExecute.rows || null;
    let isSave = 0;
    if(email.length !== 0) {
      const execute = await sails.sendNativeQuery(`UPDATE "public"."PatientEmail"
                                                    SET "Email"='${Email}'
                                                    WHERE "PatientId" = ${PatientId} AND Email = '${Email}'`);
      isSave = execute.affectedRows || 0;
    }
    else {
      // Kiểm tra số điện thoại
      const checkEmail = await PatientModel.checkEmail({ Email });
      if(!checkEmail.Code) return {
        Code: false,
        Notify: checkEmail.Notify
      };

      const sql = `INSERT INTO "public"."PatientEmail"(PatientId, Email, AddedAt, IsPrimary) VALUES ('${PatientId}', '${Email}', '${AddedAt}', '1')`;
      const execute = await sails.sendNativeQuery(sql);
      isSave = execute.affectedRows || 0;
    }

    return isSave == 0 ? {
      Code: false,
      Message: 'Cập nhật địa chỉ email không thành công!',
      Notify: [{
        Code: false,
        Message: 'Cập nhật địa chỉ email không thành công!',
      }]
    } : {
      Code: true,
      Message: 'Cập nhật địa chỉ email thành công!',
      Notify: [{
        Code: true,
        Message: 'Cập nhật địa chỉ email thành công!',
      }]
    };
  },

  savePatient: async (PatientData = null) => {

    // Không nhập đầy đủ thông tin
    if(!PatientData || Object.keys(PatientData).length === 0) return {
      Patient: null,
      Notify: [
        {
          Code: false,
          Message: 'Vui lòng nhập đầy đủ thông tin khách hàng'
        }
      ]
    };

    const { 
      PhoneNumber = null, 
      Email = null,
      FullName = ''
    } = PatientData;

    // Chưa nhập họ và tên
    if(!FullName && FullName.length === 0) return {
      Patient: null,
      Notify: [
        {
          Code: false,
          Message: 'Tên khách hàng phải trên 5 ký tự'
        }
      ]
    };

    // Các giá trị được khởi tạo mặc định
    const date = new Date();
    const time = date.getTime();
    const timestamp = ~~(time/1000);
    if(PatientData.Birthday === '') PatientData.Birthday = null;    
    PatientData.PatientCode = `NK${timestamp}`;
    PatientData.CreatedAt = ~~(time/1000);

    // Thêm khách hàng mới
    const savePatient = await PatientModel.create(PatientData).fetch();
    const PatientId = savePatient.id || null;

    if(PatientId) {
      const Notify = [{
        Code: true,
        Message: 'Thêm mới khách hàng thành công!'
      }];

      // Cập nhật số điện thoại
      try {
        const savePhone = await PatientModel.savePhone(PhoneNumber, PatientId);
        Notify.push({
          ...savePhone.Notify[0]
        }); 
      } catch (error) {
        
      }
      // Cập nhật địa chỉ email
      try {
        const saveEmail = await PatientModel.saveEmail(Email, PatientId);
        Notify.push({
          ...saveEmail.Notify[0]
        }); 
      } catch (error) {
        
      }

      // Map thông tin email, số điện thoại của 1 khách hàng
      const Patient = await PatientModel.getPatient(PatientId);
      return {
        Patient,
        Notify
      }
    }
  
    return {
      Patient: null,
      Notify: [{
        Code: false,
        Message: 'Thêm mới khách hàng thất bại!'
      }]
    }
  },

  updatePatient: async (PatientData = null, PatientId = null) => {
    if(!PatientData || !PatientId) return {
      Patient: null,
      Notify: [
        {
          Code: false,
          Message: 'Vui lòng nhập đầy đủ thông tin khách hàng'
        }
      ]
    };

    const { 
      PhoneNumber = null, 
      Email = null,
      FullName = ''
    } = PatientData;
    if(!FullName && FullName.length === 0) return {
      Patient: null,
      Notify: [
        {
          Code: false,
          Message: 'Tên khách hàng phải trên 5 ký tự'
        }
      ]
    };

    if(PhoneNumber) delete PatientData.PhoneNumber;
    if(Email) delete PatientData.Email;

    // Cập nhật thông tin khách hàng
    const date = new Date();
    PatientData.UpdatedAt = ~~(date.getTime()/1000);
    const updateInfo = await PatientModel.update({ id: PatientId }).set(PatientData).fetch();
    const [ patient = null ] = updateInfo;

    // Cập nhật khách hàng không thành công
    if(!patient && Object.values(patient).length === 0) {
      return {
        Patient: null,
        Notify: [
          {
            Code: false,
            Message: 'Vui lòng nhập đầy đủ thông tin khách hàng!'
          }
        ]
      };
    } 
    
    const Notify = [];

    // Cập nhật số điện thoại
    try {
      const savePhone = await PatientModel.savePhone(PhoneNumber, PatientId);
      Notify.push({
        ...savePhone.Notify[0]
      }); 
    } catch (error) {
      
    }
    // Cập nhật địa chỉ email
    try {
      const saveEmail = await PatientModel.saveEmail(Email, PatientId);
      Notify.push({
        ...saveEmail.Notify[0]
      }); 
    } catch (error) {
      
    }

    // Map thông tin email, số điện thoại của 1 khách hàng
    const Patient = await PatientModel.getPatient(PatientId);
    return {
      Patient,
      Notify
    }
  },

  updatePhoto: async ({ File = null , PatientId = null }, callback = null) => {
    if(!File || !PatientId) return null;
    if(File.fieldName.search('NOOP_') > 0) return null;

    try {
      await File.upload({
        dirname:  `${appPath}/assets/images/modules/patient/${PatientId}`,
        saveAs : function(file, res) {
          const fileName = file.filename.replace(' ', '');
          res(null, fileName);
          return fileName.replace(' ', '');
        }
      }, async function (e, success) {
          if(e) return callback && callback({
              Code: false,
              File: [...e],
              Notify: [{
                Code: false,
                Message: 'Tải ảnh đại diện thất bại!'
              }],
          });

          const file = { ...success[0] };
          const { 
            filename = null, 
            status = null 
          } = file;
          
          if(!filename) return callback && callback({
            Code: false,
            File: file,
            Notify: [{
              Code: false,
              Message: 'Chưa chọn ảnh đại diện để cập nhật!'
            }],
          });

          if(status && status === 'finished') {
            const execute = await PatientModel.update({ id: PatientId }).set({Photo: filename}).fetch();
            // Upload ảnh thành công
            let result = {
              Notify: [{
                Code: true,
                Message: 'Tải ảnh đại diện thành công!'
              }],
            }

            // Cập nhật dữ liệu và upload ảnh thành công
            if(execute[0].id && execute[0].id > 0) {
              result = {
                Code: true,
                File: file,
                Notify: [
                ...result.Notify,
                {
                  Code: true,
                  Message: 'Cập nhật ảnh đại diện cho khách hàng thành công!'
                }],
              };
            }
            return callback && callback(result);
          }

          return callback && callback({
            Code: false,
            File: success,
            Notify: [{
              Code: false,
              Message: 'Tải ảnh đại diện thất bại!'
            }],
          });
      });
    } catch (error) {
      return [error];
    }
  },

  changeState: async (req) => {
    const request = req.allParams(); 
    const { 
      PatientId = null,
      State = 1
    } = request;

    if(!PatientId) return {
      Status: 0,
      Patient: null,
      Notify: [{
        Code: false,
        Message: 'Cập nhật trạng thái khách hàng thất bại!'
      }]
    };

    const Patient = await PatientModel.update({ id: PatientId }).set({ State }).fetch();
    if( Object.values(Patient).length !== 0) return {
      Status: 1,
      Patient,
      Notify: [{
        Code: true,
        Message: 'Cập nhật trạng thái khách hàng thành công'
      }]
    }

    return {
      Status: 0,
      Patient: null,
      Notify: [{
        Code: false,
        Message: 'Cập nhật trạng thái khách hàng thất bại!'
      }]
    }    
  },

  getPhotoUrl: ({ 
    PatientId, 
    Photo, 
    Gender
  }) => {
    let avatar = (Gender === 2) ? require('util').format('%s/images/modules/patient/avatar-girl.jpg', baseUrl) : require('util').format('%s/images/modules/patient/avatar-boy.jpg', baseUrl);
    if(Photo && Photo != 'NULL') { 
      const imagePath = `${appPath}\\assets\\images\\modules\\patient\\${PatientId}\\${Photo}`;
      if(fs.existsSync(imagePath)) { 
        avatar = require('util').format('%s/images/modules/patient/%s/%s', baseUrl, PatientId, Photo);
      }
    }
    return avatar;
  }
};