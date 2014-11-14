package com.LWCertPinTest;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

public class LWCertPinPlugin extends CordovaPlugin {
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		if (action.equals("checkCert")){
			try {
				//TODO put certificate pinning implementation here 
				String responseText = "check Cert, " + args.getString(0);
				callbackContext.success(responseText);
			} catch (JSONException e){
				callbackContext.error("Failed to parse parameters");
			}
			return true;
		}
		
		return false;
	}
}
