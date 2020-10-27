/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
  //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝
  'GET /':  { controller: 'TestController', action:'love' },
  'GET /appointment':  { controller: 'AppointmentController', action:'getAppointments' },
  'GET /appointment/:AppointmentId':  { controller: 'AppointmentController', action:'getAppointment' },
  'POST /appointment':  { controller: 'AppointmentController', action:'save' },
  'POST /appointment/:AppointmentId':  { controller: 'AppointmentController', action:'save' },
  'POST /appointment/change-status/:AppointmentId':  { controller: 'AppointmentController', action:'changeAppointmentStatus' },
  'GET /customer':  { controller: 'CustomerController', action:'getCustomers' },
  'GET /customer/:CustomerId':  { controller: 'CustomerController', action:'getCustomer' },
  'GET /customer-profile/:CustomerId':  { controller: 'CustomerController', action:'getCustomerProfile' },
  'POST /customer/:CustomerId':  { controller: 'CustomerController', action:'saveCustomer' },
  'POST /customer':  { controller: 'CustomerController', action:'saveCustomer' },
  'GET /customer/check-phone':  { controller: 'CustomerController', action:'checkPhone' },
  'GET /customer/check-email':  { controller: 'CustomerController', action:'checkEmail' },
  'POST /customer/change-state':  { controller: 'CustomerController', action:'updateState' },
  'GET /widget/province':  { controller: 'WidgetController', action:'getProvinces' },
  'GET /widget/district':  { controller: 'WidgetController', action:'getDistricts' },
  'GET /widget/ward':  { controller: 'WidgetController', action:'getWards' },
  'GET /widget/appointment-status-note/:AppointmentStatusId':  { controller: 'WidgetController', action:'getAppointmentStatusNotes' },
  'POST /widget':  { controller: 'WidgetController', action:'getWidgets' },
  'POST /login': { controller: 'UserController', action:'login' }

  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝
  // Note that, in this app, these API endpoints may be accessed using the `Cloud.*()` methods
  // from the Parasails library, or by using those method names as the `action` in <ajax-form>.
  // '/api/v1/account/logout':                           { action: 'account/logout' },
  // 'PUT   /api/v1/account/update-password':            { action: 'account/update-password' },
  // 'PUT   /api/v1/account/update-profile':             { action: 'account/update-profile' },
  // 'PUT   /api/v1/account/update-billing-card':        { action: 'account/update-billing-card' },
  // 'PUT   /api/v1/entrance/login':                        { action: 'entrance/login' },
  // 'POST  /api/v1/entrance/signup':                       { action: 'entrance/signup' },
  // 'POST  /api/v1/entrance/send-password-recovery-email': { action: 'entrance/send-password-recovery-email' },
  // 'POST  /api/v1/entrance/update-password-and-login':    { action: 'entrance/update-password-and-login' },
  // 'POST  /api/v1/deliver-contact-form-message':          { action: 'deliver-contact-form-message' },

};
