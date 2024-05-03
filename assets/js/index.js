// Selecting elements
var $downvotesCheckbox = $("#downvotes_checkbox");
var $showDaysCheckbox = $("#days_checkbox");
var $daysInput = $("#days_input");
var $verifiedCheckbox = $("#verified_checkbox");
var $promotedCheckbox = $("#promoted_checkbox");
var $spammersCheckbox = $("#spammers_checkbox");
var $spammersInput = $("#spammers_input");
var $cheersCheckbox = $("#cheers_checkbox");
var $controlsCheckbox = $("#controls_checkbox");
var $ratioCheckbox = $("#ratio_checkbox");
var $ratioValInput = $("#ratioVal_input");

var $comMinDaysInput = $("#com_min_days_input");
var $comVerifiedCheckbox = $("#com_verified_checkbox");
var $comProCheckbox = $("#com_pro_checkbox");
var $comProplusCheckbox = $("#com_proplus_checkbox");
var $comNameText = $("#com_name_text");
var $comFlagText = $("#com_flag_text");




// Loading settings from storage
chrome.storage.local.get([
  'downvotes', 'show_days', "min_days", "verified", "promoted", "spammers", "spammers_hours", "cheers", "controls", "ratio", "ratioVal",
  "comDays", "comVerified", "comPro", "comProplus", "comName", "comFlag"
], data => {
  $downvotesCheckbox.prop('checked', data.downvotes);
  $showDaysCheckbox.prop('checked', data.show_days);
  $daysInput.val(data.min_days);
  $verifiedCheckbox.prop('checked', data.verified);
  $promotedCheckbox.prop('checked', data.promoted);
  $spammersCheckbox.prop('checked', data.spammers);
  $spammersInput.val(data.spammers_hours);
  $cheersCheckbox.prop('checked', data.cheers);
  $controlsCheckbox.prop('checked', data.controls);
  $ratioCheckbox.prop('checked', data.ratio);  
  $ratioValInput.val(data.ratioVal);

  $comMinDaysInput.val(data.comDays);
  $comVerifiedCheckbox.prop('checked', data.comVerified);  
  $comProCheckbox.prop('checked', data.comPro);  
  $comProplusCheckbox.prop('checked', data.comProplus);  
  $comNameText.val((data.comName).join(','));
  $comFlagText.val((data.comFlag).join(','));

  console.debug(data);
});

// Utility function to update Chrome storage
function updateChromeStorage(settingKey, value) {
  let setting = {};
  setting[settingKey] = value;
  chrome.storage.local.set(setting);
}

// Event handlers for checkboxes and inputs
function setupCheckboxHandlers($checkbox, settingName) {
  $checkbox.on("change", function() {
    updateChromeStorage(settingName, $checkbox.prop("checked"));
  });
}

function setupNumberInputHandlers($input, settingName) {
  $input.on("change", function() {
    updateChromeStorage(settingName, parseFloat($input.val()));
  });
}

function setupTextInputHandlers($input, settingName) {
  $input.on("change", function() {
    updateChromeStorage(settingName, ($input.val().replaceAll(' ','')).split(','));
  });
}

// Setting up event handlers for all checkboxes
setupCheckboxHandlers($downvotesCheckbox, "downvotes");
setupCheckboxHandlers($showDaysCheckbox, "show_days");
setupCheckboxHandlers($verifiedCheckbox, "verified");
setupCheckboxHandlers($promotedCheckbox, "promoted");
setupCheckboxHandlers($spammersCheckbox, "spammers");
setupCheckboxHandlers($cheersCheckbox, "cheers");
setupCheckboxHandlers($controlsCheckbox, "controls");
setupCheckboxHandlers($ratioCheckbox, "ratio");

setupCheckboxHandlers($comVerifiedCheckbox, "comVerified");
setupCheckboxHandlers($comProCheckbox, "comPro");
setupCheckboxHandlers($comProplusCheckbox, "comProplus");

// Setting up event handlers for all inputs
setupNumberInputHandlers($daysInput, "min_days");
setupNumberInputHandlers($spammersInput, "spammers_hours");
setupNumberInputHandlers($ratioValInput, "ratioVal");

setupNumberInputHandlers($comMinDaysInput, "comDays");

// setting up inputs with text separated by commas
setupTextInputHandlers($comNameText, "comName")
setupTextInputHandlers($comFlagText, "comFlag")


// "comDays", "comVerified", "comPro", "comProplus", "comName", "comFlag"
// var $comMinDaysInput = $("#com_min_days_input");
// var $comVerifiedCheckbox = $("#com_verified_checkbox");
// var $comProCheckbox = $("#com_pro_checkbox");
// var $comProplusCheckbox = $("#com_proplus_checkbox");
// var $comNameText = $("#com_name_text");
// var $comFlagText = $("#com_flag_text");
