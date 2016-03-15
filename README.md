LWCertPinTestPrj
================

Light Weight Certificate Pinning for IBM Worklight Applications

Implementing Lightweight Certificate Pinning 
in IBM Worklight Mobile Applications

Paolo Bianchini – Senior IT Architect, ISSW Italy
Marco Melillo – L2 IT Specialist, ISSW Italy		

1. Abstract
The “man in the middle” attack is a security concern for mobile and web applications in general. Applications such as mobile banking manage and send over the net private information that could be easily stolen if such attack is exploited. Certificate Pinning is a technique that enforces the control over the authenticity and signature of the server certificates used by the application to establish SSL connections. This article proposes a programmatic approach to verifying that the application is using the intended certificate leveraging the repackaging controls provided by Worklight. The article discusses advantages and drawbacks of such technique.

2. Introduction
2.1 The man in the middle attack
A major concern in the area of mobile and web application is to avoid that private information is stolen when sent over the network form the client (or the device) to the server. A common technique that hackers exploit in order to achieve such goal is to divert communication to a fake server which is put in the middle of the communication between the client the real servers. Such attacks are known as “man in the middle attacks”. 
Let's consider a Worklight based application that leverages a Worklight Adapter to verify the user credentials against a backend server. The developer might want to enable an SSL connection from the device to the server in order to crypt the information exchanged with the server and protect them from being sniffed (or read) by a third party. In scenario, the server provides a certificate to the client that is used to verify the server identity and to deliver the encryption keys used to encrypt the data so that only the server is able to decrypt them. (see fig. 1)



Fig. 1 – the application uses an original certificate issued the real server

In order to put a “man in the middle” of this client to server communication hackers can exploit several methods to install a counterfeit certificate on the client side and divert traffic to a server capable of decrypting the information sent and forwarding it to the original server. 
Any modern web browser informs the user when the certificate that has been received from the server has not been verified and issued by a trusted organization in order to prevent such kind of attacks. When considering mobile devices, possibility that fake certificates are installed and declared trusted is augmented by practices such as “jail-breaking” or “root-kitting” the phone or by an accidental temporary loss of possess of the terminal.
Once the new certificate is installed and traffic diverted to the fake server the application is not  aware that it is talking to the unauthorized server. (see fig. 2)


Fig. 2 – the application talks to a fake server 

2.2 Certificate Pinning technique
In order to protect the Mobile application from such an attack the developer must implement additional controls over the SSL certificate that it is using. In example, the application could check signer of the certificate and prevent the usage of self signed ones. Such technique is known as Certificate Pinning and en be implemented in several ways. Proposed implementations are based on ad-hoc modules or on class libraries that extend the SSL connection.

3. Implementing lightweight Certificate Pinning
3.1 Implementation
The discussed solution is based on the concept that a copy of the original certificate is bundled within the mobile application and that such information is used to verify the server identity upon application startup. IBM Worklight offers the possibility of checking that the application has not been repackaged thus making it hard for hackers to exploit the “man in the middle” attack. (see fig. 3)


Fig. 3 – Lightweight Certificate Pinning protection

More specifically, the certificate will be imported in a key-store bundled within the application resources and protected by password. A piece of native code will be added to the mobile application in order to access the key-store retrieve the distributed certificate (instead of using the one installed on the device) and setup a SSL connection with the Worklight Server and throw a “Server not verified” exception if such connection fails. (see fig. 4)

Fig. 4 – The test fails.

3.1.1 Key-store creation
In order to create a key-store and import the correct certificate into it you can use the keytool provided with the Java Runtime Environment provided with your IBM WebSphere Application Server installation. 
Android applications can handle keystore types defined as BKS while the default for Websphere is JKS. Therefore a jar is needed and must be downloaded on your server.

bcprov-ext-jdk15on-1.46.jar

Once you have downloaded the needed jar you can issue the following command to create the key-store; keytool is located in the java/bin directory of your <WEBSPHERE_INSTALLROOT>.

> bin/keytool	-genkey
		-alias keystore_alias
		-keyalg RSA
		-keystore keystore_filename.bks
		-storetype BKS
		-provider org.bouncycastle.jce.provider.BouncyCastleProvider
		-providerpath /path_to/bcprov-ext-jdk15on-1.46.jar
		-keysize 2048

You now need to import the original certificate into the key-store.

> bin/keytool 	-import
			-trustcacerts
			-alias keystore_alias 
			-file certificate_filename
			-keystore keystore_filename.bks
			-provider org.bouncycastle.jce.provider.BouncyCastleProvider 			-providerpath /path_to/bcprov-ext-jdk15on-1.46.jar 
			-storetype BKS

You can verify if the certificate was imported correctly by issuing the following:

> bin/keytool	-list 
		-v 
		-keystore keystore_filename.bks
		-provider org.bouncycastle.jce.provider.BouncyCastleProvider
		-providerpath /path_to/bcprov-ext-jdk15on-1.46.jar 
		-storetype BKS

3.1.2 Testing the server
Worklight allows the developer to use native code using an infrastructure called Apache Cordova Plugin. This native code can be called into Javascript extending functionality not available in Apache Cordova. This is valid for iOS and Android. As example, we show the Android platform. 
The reader can refer to the product documentation for the iOS implementation, in order to apply the same conceptual steps illustrated hereafter:
create a Worklight project and with an hybrid application, add Android Environment
declare a function in common folder that will be overridden called checkCert
create a Java class called LWCertPinPlugin that extends CordovaPlugin in Android project. This class executes the SSL call and verifies the certificate
modify config.xml in res/xml Android Project to reflect the use of this plugin
declare a cordova.exec() call API inside the Javascript code (hybrid application) to execute a native call overriding the generic in common. This declaration will be in the Android environment.

1) Create a Worklight project with name LWCertPinTestProject and an hybrid application with name LWCertPinTest. Add Android Environment to the application.


















Worklight create automatically an Android project called LWCertPinTestProjectLWCertPinTestAndroid.

2) expand your Android project under res/xml and modify the config.xml adding a new Plugin

<plugin name="LWCertPinPlugin" value="com.LWCertPinTest.LWCertPinPlugin" />

3) Create a Java class called LWCertPinPlugin that extends CordovaPlugin in Android project.
As starting point override the execute method of superclass and put a simple implementation to test the Cordova plugin as template.

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

4) Go back to the hybrid application and write code in android environment folder to override the default implementation calling the apache Cordova plugin. Modify the javascript called LWCertPinTest.js adding code to call API. Please note, the hostname will be passed as parameter.

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

5) create a generic javascript function in the common folder, inside hybrid application, with the same file name LWCertPinTest.js. Please note the name must be the same, this function has been overridden.

function checkCert(){
	alert("Check Certificate with Native device");
}

6) modify the main LWCertPinTest.html passing the hostname as input parameter and put a submit button that invoke the Apache Cordova Plugin. Please note the call to the generic javascript checkCert.

<div id="AppBody">
	<div id="header">
		<h1>Certificate Pinning Test</h1>
	</div>
			
	<div id="wrapper">
		<input type="text" value="hostname" id="hostname" />
		<input type="button" value="Check Certificate" onclick="checkCert()"/>
	</div>
</div>

7) Now you can test if the Apache Cordova Plugin is ready to be customized starting the application into Android Environment using the Android Emulator (after a build of course).

















8) The core of the solution is to load the real certificate into the bundle application. Worklight offers protection to tampering so the certificate cannot be modified. To load the certificate in native Android project, put the keystore.bks in Android project under res/raw folder.

In order to test the server you can use some Java coding to access the keystore and establish a SSL connection with the intended server. Here's a possible implementation of the test passing hostname as parameter and removing the previous simple implementation.

// get the keystore resource
KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
InputStream ksIS = cordova.getActivity().getApplicationContext().getResources().openRawResource(R.raw.keystore_filename);
// might want to store encrypted 
keyStore.load(ksIS, "keystorepassword".toCharArray());
TrustManagerFactory tmf = TrustManagerFactory.getInstance("X509");

//try to connect
tmf.init(keyStore);
SSLContext context = SSLContext.getInstance("TLS");
context.init(null, tmf.getTrustManagers(), null);
URL url = new URL(hostname);
HttpsURLConnection urlConnection = (HttpsURLConnection) url.openConnection();
	urlConnection.setSSLSocketFactory(context.getSocketFactory());
InputStream in = urlConnection.getInputStream();
	
// test and manage accordingly
if(in != null) {
	in.close();
	// return host verified
	callbackContext.success(“server verified”);
	return true;
} else {
	in.close();
	// return could not verify
	callbackContext.error("server " + hostname + “ not verified”);
	return false;
}

Note the cordova.getActivity().getApplicationContext().getResources().openRawResource method, this allows Apache Cordova to read the folder named res/raw, the location where the certificate was placed. Modify the code for your convenience and import all packages needed. To complete apache cordova framework, it is important to return a value of succes or failure of the test and a callbackContext. The Android 4.2 core library supports certificate pinning, but of course you would like to have an implementation more generic for older versions.

4. Conclusion
The article has described a possible approach to enhanced security. As always, enhanced security adds overhead and additional coding costs. The proposed solution balances costs and benefits providing a flexible and lightweight approach to the Certificate Pinning technique implementation.

5. References
Worklight infocenter : http://pic.dhe.ibm.com/infocenter/wrklight/v6r0m0/index.jsp?topic=%2Fcom.ibm.help.doc%2Fwl_home.html

Adding native functionality to hybrid apps with Apache Cordova: http://www.ibm.com/developerworks/mobile/worklight/getting-started.html#cordova

Certificate Pinning: https://www.owasp.org/index.php/Certificate_and_Public_Key_Pinning#What.27s_the_problem.3F

Security with HTTPS and SSL: http://developer.android.com/training/articles/security-ssl.html
