import { Headers } from "node-fetch";

var config = {
  gmailAPI: {
		client_id: "444760616542-kte2ht2ffoalosndlssps2a2ae1jului.apps.googleusercontent.com",
		client_secret: "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",
		refresh_token: "1//03z1l_pQ5faR6CgYIARAAGAMSNwF-L9IrfbBzl_6e7V4prW4D4JNMdv9EgXbtPbM_q91mdcIwYKMU2dMcnlWoHm7h0lqaFE0pHa4"
	},
}
var access_token =  await getAccessToken();

var password="";
var url = "";
var tenSecondsBeforeNow = 10 * 1000;
var getTenSecondsBeforeNow = new Date(new Date().getTime() - tenSecondsBeforeNow);
var current_Date = new Date();

var fifteenMinutesInMilliseconds = 15 * 60 * 1000; // 15 minutes * 60 seconds/minute * 1000 milliseconds/second
var get15MinutesBeforeNow = new Date(new Date().getTime() - fifteenMinutesInMilliseconds);


async function getAccessToken() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", config.gmailAPI.client_id);
    urlencoded.append("client_secret", config.gmailAPI.client_secret);
    urlencoded.append("refresh_token", config.gmailAPI.refresh_token);
    urlencoded.append("grant_type", "refresh_token");

    urlencoded.append("scope", "https://mail.google.com/");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    try {
      const response = await fetch("https://accounts.google.com/o/oauth2/token", requestOptions);
      const result = await response.json();
      access_token = result.access_token;
      return access_token;
    } catch (error) {
      console.log("error", error);
    }
}

async function getLastEmailId(account) {
	//const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=to:${activeUser.email}%20AND%20from:Info@blsinternational.com&orderBy=internalDate%20desc`;
	//const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=in:inbox&orderBy=internalDate%20desc`;
	//const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=to:${email}&orderBy=internalDate%20desc`;
	const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(`"${account}"`)}&maxResults=1`;
  console.log("email: "+ account);

	try {
		const response = await fetch(apiUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
      console.log(typeof response.status+" : "+ response.status)
      if (response.status == 400) {
        console.log("400");
        await getLastEmailId(account)
      }else{
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
		} else {
			const data = await response.json();
			//console.log(data);
			return data.messages[0].id;
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}
}
function decodeBase64HTML(encodedString) {
	try {
		// Replace URL-safe characters
		encodedString = encodedString.replace(/-/g, "+").replace(/_/g, "/");

		// Add padding if needed
		while (encodedString.length % 4) {
			encodedString += "=";
		}

		// Decode the base64 string
		var decodedString = atob(encodedString);

		// Return the decoded string
		return decodedString;
	} catch (error) {
		// Handle decoding errors
		console.error("Error decoding base64 string:", error);
		return null;
	}
}
export async function getEmailContent(account, type) {
	try {
		var id = await getLastEmailId(account);
		const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`;

		const response = await fetch(apiUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			// handelRequestError(500);
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		const emailDate = new Date(data.payload.headers.find((element) => element.name === "Date").value);
    console.log(data.payload.headers.find((element) => element.name === "Date").value)
		console.log("Email date : ==> ", emailDate);
		console.log("la difference :", getTenSecondsBeforeNow - emailDate);

		if ( (get15MinutesBeforeNow - emailDate) > 0) {
			await getEmailContent(account);
		} else {
			let bodybase64 = data.payload.body.data;
			let decodedEmailBody = decodeBase64HTML(bodybase64);
      console.log(decodedEmailBody);
			let passwordMatch = decodedEmailBody.match(/\d{6}</g);
      let vereficationUrlMatch = decodedEmailBody.match(/http.*'/)

      
			if(type === "password"){
        password = passwordMatch[0].slice(0, -1);
        console.log("Password inside getEmailContent: ",passwordMatch[0].slice(0, -1));
        return password;
      }
      else if(type === "url"){
        console.log("verefication url: ", vereficationUrlMatch[0].slice(0, -1));
        //await page.goto(vereficationUrlMatch[0].slice(0, -1));

      }
			//return validateOtp(otp);

			//return otpmatch[0].slice(0, -1);
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}
}

// getEmailContent("bls_prt_wrk_00013@schngn.33mail.com","url")
