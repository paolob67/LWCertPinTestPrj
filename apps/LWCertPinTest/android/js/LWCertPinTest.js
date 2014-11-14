/**
 *  @license
 *  Licensed Materials - Property of IBM
 *  5725-G92 (C) Copyright IBM Corp. 2011, 2013. All Rights Reserved.
 *  US Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

// This method is invoked after loading the main HTML and successful initialization of the Worklight runtime.
function wlEnvInit(){
    wlCommonInit();
    // Environment initialization code goes here
}

function checkCert(){
	var name = $("#hostname").val();
	cordova.exec(checkCertSuccess, checkCertFailure, "LWCertPinPlugin", "checkCert", [name]);
}

function checkCertSuccess(data){
	alert("OK: " + data);
}

function checkCertFailure(data){
	alert("FAIL: " + data);
}