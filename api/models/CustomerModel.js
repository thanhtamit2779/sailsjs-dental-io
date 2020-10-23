/**
 * CustomerModel.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const fs = require('fs');
const appPath = sails.config.appPath;
const baseUrl = sails.config.custom.baseUrl;

module.exports = {
  tableName: 'customer',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      columnName: 'CustomerId'
    },
    CustomerIdNumber: {
      type: 'string',
      allowNull: true    
    },
    CustomerStatusId: {
      type: 'number',
      allowNull: true
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
    CountryId: {
      type: 'number',
      allowNull: true    
    },
    ProvinceId: {
      type: 'number',
      allowNull: true
    },
    DistrictId: {
      type: 'number',
      allowNull: true    
    },
    WardId: {
      type: 'number',
      allowNull: true    
    },
    CreatedAt: {
      type: 'number',
      allowNull: true    
    },
    CreatedBy: {
      type: 'number',
      allowNull: false    
    },
    UpdatedAt: {
      type: 'number',
      allowNull: true    
    },
    UpdatedBy: {
      type: 'number',
      allowNull: false    
    },
    FromChannel: {
      type: 'number',
      defaultsTo: 741,        
    },
    CustomerTypeId: {
      type: 'number',
      defaultsTo: 1,    
    },
    LastActive: {
      type: 'number',
      allowNull: true    
    },
    State: {
      type: 'number',
      allowNull: false,
      defaultsTo: 1    
    },
    CustomerCode: {
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

  getCustomers: async (request) => {
    let { 
      CustomerTypeId = 0,
      Keyword = '',
      State = -1,
      ProvinceId = 0,
      DistrictId = 0,
      WardId = 0,
      Page = 1,
      PerPage = 10 
    } = request;

    const perPage = parseInt(PerPage);
    const page = parseInt(Page);
    const Offset = (parseInt(page) - 1) * parseInt(perPage);

    const sqlTotal =  `SELECT "c"."CustomerId" as "TotalCustomer"`;
    const sqlSelect = `SELECT 
                        "c"."CustomerId", 
                        "c"."FullName", 
                        "c"."Gender", 
                        "c"."Birthday", 
                        "c"."State",       
                        "c"."Photo", 
                        "c"."CustomerTypeId", 
                        "c"."CustomerCode", 
                        "c"."Note",
                        "c"."ProvinceId",
                        "c"."DistrictId",
                        "c"."WardId",
                        "c"."Address",
                        "c"."UpdatedAt",
                        "c"."UpdatedBy",
                        (SELECT COUNT("AppointmentId") FROM "public"."appointment" as "a" WHERE "a"."CustomerId" = "c"."CustomerId") AS "TotalAppointment"`;
    let sql = `FROM "public"."customer" as "c" WHERE 1 = 1`;

    if(Keyword.length > 2) {
      // Search By
      // 1. FullName
      // 2. CustomerCode
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
          sql += ` AND "c"."CustomerCode" LIKE '%${Keyword}%'`;
          break;

        case 3:
          sql += ` AND "c"."CustomerId" IN (SELECT "CustomerId" FROM "public"."customerphonenumber" WHERE "PhoneNumber" LIKE '%${Keyword}%')`;
          break;

        default:
          sql += ` AND "c"."FullName" LIKE '%${Keyword}%'`;
          break;
      }
    }

    if(DistrictId > 0) {
      sql += ` AND "c"."DistrictId"=${DistrictId}`;
    }

    if(ProvinceId > 0) {
      sql += ` AND "c"."ProvinceId"=${ProvinceId}`;
    }

    if(WardId > 0) {
      sql += ` AND "c"."WardId"=${WardId}`;
    }

    if(State >= 0) {
      sql += ` AND "c"."State"=${State}`;
    }
    
    if(CustomerTypeId > 0) {
      sql += ` AND "c"."CustomerTypeId" = ${CustomerTypeId}`;
    }
    sql += ` ORDER BY "c"."CustomerId" DESC`;

    const sqlTotalQuery = `${sqlTotal} ${sql}`;
    const sqlQuery = `${sqlSelect} ${sql} LIMIT ${perPage} OFFSET ${Offset}`;
    const execute = await sails.sendNativeQuery(sqlQuery);
    const customers = execute.rows || [];
    if(customers.length === 0) return [];

    const customerIds = [];
    let staffIds = [];
    let ProvinceIds = [];
    let DistrictIds = [];
    let WardIds = [];
    customers.map(v => {
      const { 
        CustomerId,
        UpdatedBy = null,
        ProvinceId = null,
        DistrictId = null,
        WardId = null,
      } = v;
      customerIds.push(CustomerId);
      if(UpdatedBy && UpdatedBy > 0) staffIds.push(UpdatedBy);
      if(ProvinceId && ProvinceId > 0) ProvinceIds.push(ProvinceId);
      if(DistrictId && DistrictId > 0) DistrictIds.push(DistrictId);
      if(WardId && WardId > 0) WardIds.push(WardId);
      return v;
    });
    staffIds = [...new Set(staffIds)];
    ProvinceIds = [...new Set(ProvinceIds)];
    DistrictIds = [...new Set(DistrictIds)];
    WardIds = [...new Set(WardIds)]; 

    const customerTypes = await WidgetModel.getCustomerTypes();
    const customerPhones = await CustomerModel.getPhonesByCustomerIds(customerIds);
    const customerEmails = await CustomerModel.getEmailsByCustomerIds(customerIds);
    const staffs = await WidgetModel.getStaffsByIds(staffIds);
    const provinces = await WidgetModel.getProvincesByIds(ProvinceIds);
    const districts = await WidgetModel.getDistrictsByIds(DistrictIds);
    const wards = await WidgetModel.getWardsByIds(WardIds);
  
    customers.map(v => {
      const { 
        CustomerId,
        CustomerTypeId,
        Gender,
        Photo,
        UpdatedBy = null,
        ProvinceId = null,
        DistrictId = null,
        WardId = null,
      } = v;
      v.Photo = CustomerModel.getPhotoUrl({ CustomerId, Gender, Photo });
      v.CustomerPhoneNumber = customerPhones.filter(v => v.CustomerId == CustomerId) || null;
      v.CustomerEmail = customerEmails.filter(v => v.CustomerId == CustomerId) || null;
      v.CustomerType = customerTypes.find(v => v.CustomerTypeId == CustomerTypeId);
      v.EditBy = staffs.find(v => v.StaffId == UpdatedBy) || null;
      v.Province = provinces.find(v => v.VnProvinceId == ProvinceId);
      v.District = districts.find(v => v.VnDistrictId == DistrictId);
      v.Ward = wards.find(v => v.VnWardId == WardId);
      return v;
    });

    const executeTotal = await sails.sendNativeQuery(sqlTotalQuery);
    const totalCustomer = executeTotal.rows || [];
    const Total = totalCustomer.length || 0;
    const customer = {
      Customers: customers,
      Pagination: {
        Total,
        TotalPage: Math.ceil(Total/perPage),
        Page: page,
        PerPage: perPage
      }
    };
    return customer;
  },

  getCustomer: async (CustomerId) => {
    if(!CustomerId) return null;

    const customer = await CustomerModel.findOne({
      where: { id: CustomerId }
    });
    if(!customer && !customer.id) return null;

    customer.CustomerId = customer.id;
    delete customer.id;

    const { 
      Gender,
      Photo,
      ProvinceId = null,
      DistrictId = null,
      WardId = null, 
    } = customer;
    console.log('Photo DB -> ',  Photo);

    let ProvinceIds, DistrictIds, WardIds = [];
    
    if(ProvinceId && ProvinceId > 0) ProvinceIds = [...new Set([ProvinceId])];
    const provinces = await WidgetModel.getProvincesByIds(ProvinceIds);

    if(DistrictId && DistrictId > 0) DistrictIds = [...new Set([DistrictId])];
    const districts = await WidgetModel.getDistrictsByIds(DistrictIds);

    if(WardId && WardId > 0) WardIds = [...new Set([WardId])]; 
    const wards = await WidgetModel.getWardsByIds(WardIds);

    customer.Photo = CustomerModel.getPhotoUrl({ Gender, Photo, CustomerId });
    customer.CustomerPhoneNumber = await CustomerModel.getPhonesByCustomerIds([CustomerId]);
    customer.CustomerEmail = await CustomerModel.getEmailsByCustomerIds([CustomerId]);
    customer.Province = provinces.find(v => v.VnProvinceId == ProvinceId);
    customer.District = districts.find(v => v.VnDistrictId == DistrictId);
    customer.Ward = wards.find(v => v.VnWardId == WardId);
    return customer;
  },

  getCustomerProfile: async (CustomerId) => {
    if(!CustomerId) return null;

    // Thông tin khách hàng
    const Customer = await CustomerModel.getCustomer(CustomerId);

    // Danh mục ghi chú
    const executeNoteCategory = await sails.sendNativeQuery(`SELECT "CustomerNoteCategoryId", "Name" FROM "public"."customernotecategory" WHERE "State" = 1`);
    const customerNoteCategories = executeNoteCategory.rows || [];

    // Ghi chú
    let staffIds = [];
    const CustomerNotes = await CustomerNoteModel.find({
      where: { CustomerId }
    }).sort([{ AddedAt: 'DESC' }]);

    CustomerNotes.length !== 0 && CustomerNotes.map(v => {
      const { 
        id,
        AddedBy
      } = v;
      staffIds.push(AddedBy);
      v.CustomerNoteId = id;
      delete v.id;
      return v;
    });

    staffIds = [... new Set(staffIds) ];
    const staffs = await WidgetModel.getStaffsByIds(staffIds);
    
    CustomerNotes.length !== 0 && CustomerNotes.map(v => {
      const { 
        CustomerNoteCategoryId,
        AddedBy 
      } = v;
      v.CustomerNoteCategory = customerNoteCategories.find(v => v.CustomerNoteCategoryId == CustomerNoteCategoryId) || null;
      v.AddedBy = staffs.find(v => v.StaffId === AddedBy) || null;
      return v;
    });

    // Lịch hẹn
    const Appointments = await CustomerModel.getAppointmentsByCustomerId(CustomerId);

    // Phản hồi
    const Complaints = await CustomerModel.getComplaintsCustomerId(CustomerId);

    // Mối quan hệ
    //const CustomerRelationship = await CustomerModel.getCustomerRelationshipByCustomerId(CustomerId);

    return {
      Customer,
      CustomerNotes,
      Appointments,
      Complaints
    }
  },

  getAppointmentsByCustomerId: async (CustomerId = null) => {
    if(!CustomerId) return [];

    const appointments = await AppointmentModel.find({
      where: { CustomerId },
      select: [
        'StartAt', 
        'EndAt', 
        'Note', 
        'CustomerId', 
        'AppointmentLabelId', 
        'CustomerId', 
        'CreatedAt',
        'CreatedBy',
        'EditedAt',
        'EditedBy',
        'AppointedTo',
        'AtBranchId',
        'AppointmentStatusId'
      ]}).sort([{ StartAt: 'DESC' }]);
    
    let staffIds = [];
    let branchIds = [];
    let doctorIds = [];
    appointments.length !== 0 && appointments.map(v => {
      const { 
        EditedBy,
        CreatedBy,
        AppointedTo,
        AtBranchId,
        id
      } = v;

      if(EditedBy > 0) staffIds.push(EditedBy);
      if(CreatedBy > 0) staffIds.push(CreatedBy);
      if(AppointedTo > 0) doctorIds.push(AppointedTo);
      if(AtBranchId > 0) branchIds.push(AtBranchId);

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
        AppointedTo,
        AtBranchId,
        AppointmentLabelId,
        AppointmentStatusId
      } = v;

      v.Editor = staffs.find(v => v.StaffId == EditedBy) || null;
      v.Creator = staffs.find(v => v.StaffId == CreatedBy) || null;
      v.Doctor = doctors.find(v => v.DoctorId == AppointedTo) || null;
      v.Branch = branchs.find(v => v.BranchId == AtBranchId) || null;
      v.AppointmentType = appointmentTypes.find(v => v.AppointmentLabelId == AppointmentLabelId) || null;
      v.AppointmentStatus = appointmentStatus.find(aps => aps.AppointmentStatusId == AppointmentStatusId) || null;

      return v;
    });
    
    return appointments;
  },

  getComplaintsCustomerId: async (CustomerId = null) => {
    if(!CustomerId) return [];

    // Phản hồi
    const complaints = await CustomerComplaintModel.find({
      where: { CustomerId }
    }).sort([{ ComplaintedAt: 'DESC' }]);

    // Thuộc nhóm phản hồi nào
    const executeComplaintReasonGroups = await sails.sendNativeQuery(`SELECT * FROM "public"."complaintreasongroup" WHERE "State" = 1`);
    const complaintReasonGroups = executeComplaintReasonGroups.rows || [];

    // Bộ phận phản hồi
    const executeComplaintAboutReason = await sails.sendNativeQuery(`SELECT "ComplaintAboutReasonId", "ComplaintReasonGroupId", "Reason" FROM "public"."complaintaboutreason" WHERE "State" = 1`);
    const complaintAboutReasons = executeComplaintAboutReason.rows || [];

    // Map dữ liệu
    complaintAboutReasons.length !== 0 && complaintAboutReasons.map(v => {
      const { ComplaintReasonGroupId } = v;
      v.ComplaintReasonGroup = complaintReasonGroups.find(v => v.ComplaintReasonGroupId == ComplaintReasonGroupId) || null;
      return v;
    });

    complaints.length !== 0 && complaints.map(v => {
      const { ComplaintAboutReasonId, CreatedBy } = v;
      v.ComplaintAboutReason = complaintAboutReasons.find(v => v.ComplaintAboutReasonId == ComplaintAboutReasonId) || null;
      v.CustomerComplaintId = v.id;
      delete v.id;
      return v;
    });

    return complaints;
  },

  getPhonesByCustomerIds: async (CustomerIds = []) => {
    if(CustomerIds.length === 0) return [];

    const whereIn = CustomerIds.join();
    const sql = `SELECT "PhoneNumber", "CustomerId" FROM "public"."customerphonenumber" WHERE "CustomerId" IN (${whereIn}) ORDER BY "ExpiredAt" ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getEmailsByCustomerIds: async (CustomerIds = []) => {
    if(CustomerIds.length === 0) return [];

    const whereIn = CustomerIds.join();
    const sql = `SELECT * FROM "public"."customeremail" WHERE "CustomerId" IN (${whereIn})`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
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

    const sql = `SELECT PhoneNumber 
                 FROM customerphonenumber 
                 WHERE PhoneNumber='${PhoneNumber}'`;
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

    const sql = `SELECT Email 
                 FROM customeremail 
                 WHERE Email='${Email}'`;
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

  savePhone: async (PhoneNumber = null, CustomerId = null) => {
    if(!PhoneNumber && !CustomerId) return {
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

    const phoneExecute = await sails.sendNativeQuery(`SELECT PhoneNumber 
                                                            FROM customerphonenumber
                                                            WHERE PhoneNumber = '${PhoneNumber}' AND CustomerId = ${CustomerId}`);
    const phone = phoneExecute.rows || [];
    let isSave = 0;
    if(phone.length !== 0) {
      // Cập nhật tất cả số điện thoại hết hạn
      await sails.sendNativeQuery(`UPDATE customerphonenumber 
                                  SET ExpiredAt=${ExpiredAt} 
                                  WHERE CustomerId = ${CustomerId} AND PhoneNumber != '${PhoneNumber}'`);

      // Active
      const execute = await sails.sendNativeQuery(`UPDATE customerphonenumber
                                                        SET ExpiredAt=0
                                                        WHERE CustomerId = ${CustomerId} AND PhoneNumber = '${PhoneNumber}'`);
      isSave = execute.affectedRows || 0;
    } 
    else {
      // Kiểm tra số điện thoại
      const checkPhone = await CustomerModel.checkPhone({ PhoneNumber });
      if(!checkPhone.Code) return {
        Code: false,
        Notify: checkPhone.Notify
      };

      const sql = `INSERT INTO customerphonenumber(PhoneNumber, CustomerId, AddedAt, ExpiredAt) VALUES ('${PhoneNumber}', '${CustomerId}', '${AddedAt}', '0')`;
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

  saveEmail: async (Email = null, CustomerId = null) => {
    if(!Email && !CustomerId) return {
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
                                                      FROM customeremail
                                                      WHERE Email = '${Email}' AND CustomerId = ${CustomerId}`);
    const email = emailExecute.rows || [];
    let isSave = 0;
    if(email.length !== 0) {
      const execute = await sails.sendNativeQuery(`UPDATE customeremail
                                                    SET Email='${Email}'
                                                    WHERE CustomerId = ${CustomerId} AND Email = '${Email}'`);
      isSave = execute.affectedRows || 0;
    }
    else {
      // Kiểm tra số điện thoại
      const checkEmail = await CustomerModel.checkEmail({ Email });
      if(!checkEmail.Code) return {
        Code: false,
        Notify: checkEmail.Notify
      };

      const sql = `INSERT INTO customeremail(CustomerId, Email, AddedAt, IsPrimary) VALUES ('${CustomerId}', '${Email}', '${AddedAt}', '1')`;
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

  saveCustomer: async (CustomerData = null) => {

    // Không nhập đầy đủ thông tin
    if(!CustomerData || Object.keys(CustomerData).length === 0) return {
      Customer: null,
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
    } = CustomerData;

    // Chưa nhập họ và tên
    if(!FullName && FullName.length === 0) return {
      Customer: null,
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
    if(CustomerData.ProvinceId === '') CustomerData.ProvinceId = null;
    if(CustomerData.DistrictId === '') CustomerData.DistrictId = null;
    if(CustomerData.WardId === '') CustomerData.WardId = null;
    if(CustomerData.Birthday === '') CustomerData.Birthday = null;    
    CustomerData.CustomerCode = `NK${timestamp}`;
    CustomerData.CreatedAt = ~~(time/1000);

    // Thêm khách hàng mới
    const saveCustomer = await CustomerModel.create(CustomerData).fetch();
    const CustomerId = saveCustomer.id || null;

    if(CustomerId) {
      const Notify = [{
        Code: true,
        Message: 'Thêm mới khách hàng thành công!'
      }];

      // Cập nhật số điện thoại
      try {
        const savePhone = await CustomerModel.savePhone(PhoneNumber, CustomerId);
        Notify.push({
          ...savePhone.Notify[0]
        }); 
      } catch (error) {
        
      }
      // Cập nhật địa chỉ email
      try {
        const saveEmail = await CustomerModel.saveEmail(Email, CustomerId);
        Notify.push({
          ...saveEmail.Notify[0]
        }); 
      } catch (error) {
        
      }

      // Map thông tin email, số điện thoại của 1 khách hàng
      const Customer = await CustomerModel.getCustomer(CustomerId);
      return {
        Customer,
        Notify
      }
    }
  
    return {
      Customer: null,
      Notify: [{
        Code: false,
        Message: 'Thêm mới khách hàng thất bại!'
      }]
    }
  },

  updateCustomer: async (CustomerData = null, CustomerId = null) => {
    if(!CustomerData || !CustomerId) return {
      Customer: null,
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
    } = CustomerData;
    if(!FullName && FullName.length === 0) return {
      Customer: null,
      Notify: [
        {
          Code: false,
          Message: 'Tên khách hàng phải trên 5 ký tự'
        }
      ]
    };

    if(PhoneNumber) delete CustomerData.PhoneNumber;
    if(Email) delete CustomerData.Email;

    // Cập nhật thông tin khách hàng
    const date = new Date();
    CustomerData.UpdatedAt = ~~(date.getTime()/1000);
    const updateInfo = await CustomerModel.update({ id: CustomerId }).set(CustomerData).fetch();
    const [ customer = null ] = updateInfo;

    // Cập nhật khách hàng không thành công
    if(!customer && Object.values(customer).length === 0) {
      return {
        Customer: null,
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
      const savePhone = await CustomerModel.savePhone(PhoneNumber, CustomerId);
      Notify.push({
        ...savePhone.Notify[0]
      }); 
    } catch (error) {
      
    }
    // Cập nhật địa chỉ email
    try {
      const saveEmail = await CustomerModel.saveEmail(Email, CustomerId);
      Notify.push({
        ...saveEmail.Notify[0]
      }); 
    } catch (error) {
      
    }

    // Map thông tin email, số điện thoại của 1 khách hàng
    const Customer = await CustomerModel.getCustomer(CustomerId);
    return {
      Customer,
      Notify
    }
  },

  updatePhoto: async ({ File = null , CustomerId = null }, callback = null) => {
    if(!File || !CustomerId) return null;
    if(File.fieldName.search('NOOP_') > 0) return null;

    try {
      await File.upload({
        dirname: require('path').resolve(sails.config.appPath, `assets/images/modules/customer/${CustomerId}`),
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
          console.log('success upload -> ', success);
          console.log('file -> ', file);
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
            const execute = await CustomerModel.update({ id: CustomerId }).set({Photo: filename}).fetch();
      
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
      CustomerId = null,
      State = 1
    } = request;

    if(!CustomerId) return {
      Status: 0,
      Customer: null,
      Notify: [{
        Code: false,
        Message: 'Cập nhật trạng thái khách hàng thất bại!'
      }]
    };

    const Customer = await CustomerModel.update({ id: CustomerId }).set({ State }).fetch();
    if( Object.values(Customer).length !== 0) return {
      Status: 1,
      Customer,
      Notify: [{
        Code: true,
        Message: 'Cập nhật trạng thái khách hàng thành công'
      }]
    }

    return {
      Status: 0,
      Customer: null,
      Notify: [{
        Code: false,
        Message: 'Cập nhật trạng thái khách hàng thất bại!'
      }]
    }    
  },

  getPhotoUrl: ({ 
    CustomerId, 
    Photo, 
    Gender
  }) => {
    console.log('Photo -> ', Photo);
    let avatar = (Gender === 2) ? require('util').format('%s/images/modules/customer/avatar-girl.jpg', baseUrl) : require('util').format('%s/images/modules/customer/avatar-boy.jpg', baseUrl);
    if(Photo && Photo != 'NULL') { 
      const imagePath = `${appPath}\\assets\\images\\modules\\customer\\${CustomerId}\\${Photo}`;
      console.log('imagePath -> ', imagePath);
      if(fs.existsSync(imagePath)) avatar = require('util').format('%s/images/modules/customer/%s/%s', baseUrl, CustomerId, Photo);
    }
    console.log('imageUrl -> ', avatar);
    return avatar;
  }
};

