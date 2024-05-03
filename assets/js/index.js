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

// Loading settings from storage
chrome.storage.local.get([
  'downvotes', 'show_days', "min_days", "verified", "promoted", "spammers", "spammers_hours", "cheers", "controls", "ratio", "ratioVal"
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

function setupInputHandlers($input, settingName) {
  $input.on("change", function() {
    updateChromeStorage(settingName, $input.val());
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

// Setting up event handlers for all inputs
setupInputHandlers($daysInput, "min_days");
setupInputHandlers($spammersInput, "spammers_hours");
setupInputHandlers($ratioValInput, "ratioVal");
