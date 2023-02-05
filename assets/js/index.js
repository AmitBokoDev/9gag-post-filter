var $show_days = $("#days_checkbox");
var $days_input = $("#days_input");
var $anon_checkbox = $("#anon_checkbox");
var $verified_checkbox = $("#verified_checkbox");

// $(document).ready(async function(){

	chrome.storage.local.get( ['show_days',"min_days","anon","verified"], data => {
		// alert(data.show_days);
		$show_days.prop('checked', data.show_days);
		$anon_checkbox.prop('checked', data.anon);
		$verified_checkbox.prop('checked', data.verified);
		$days_input.val(data.min_days);
	} ); 

	$show_days.on("change", async function(){
		chrome.storage.local.set({ "show_days": $show_days.prop("checked") }).then(() => {
			// alert("Value is set to " + $show_days.prop("checked"));
		});
	});


	$anon_checkbox.on("change", async function(){
		chrome.storage.local.set({ "anon": $anon_checkbox.prop("checked") }).then(() => {
			// alert("Value is set to " + $show_days.prop("checked"));
		});
	});


	$verified_checkbox.on("change", async function(){
		chrome.storage.local.set({ "verified": $verified_checkbox.prop("checked") }).then(() => {
			// alert("Value is set to " + $show_days.prop("checked"));
		});
	});


	$days_input.on("change", async function(){
		chrome.storage.local.set({ "min_days": $days_input.val() }).then(() => {
			// alert("Value is set to " + $show_days.prop("checked"));
		});
	});


// })


// chrome.storage.local.get( ['notifyCount'], data => {
// 	let value = data.notifyCount || 0;
// 	counter.innerHTML = value;
// } );

// chrome.storage.onChanged.addListener( ( changes, namespace ) => {
// 	if ( changes.notifyCount ) {
// 		let value = changes.notifyCount.newValue || 0;
// 		counter.innerHTML = value;
// 	}
// });

// reset.addEventListener( 'click', () => {
// 	chrome.storage.local.clear();
// 	text.value = '';
// } );

// notify.addEventListener( 'click', () => {
// 	chrome.runtime.sendMessage( '', {
// 		type: 'notification',
// 		message: text.value
// 	});
// } );
