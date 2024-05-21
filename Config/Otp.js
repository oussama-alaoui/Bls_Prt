import { google } from "googleapis";
import dotenv from 'dotenv';
dotenv.config();

async function getAccessToken() {
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

	var urlencoded = new URLSearchParams();
	urlencoded.append("client_id",  process.env.GMAIL_CLIENT_ID);
	urlencoded.append("client_secret", process.env.GMAIL_CLIENT_SECRET);
	urlencoded.append("refresh_token", process.env.GMAIL_REFRESH_TOKEN);
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
		const access_token = result.access_token;
		console.log(access_token);
		return access_token;
	} catch (error) {
		console.log("error", error);
	}
}

async function getLastEmailId(email) {
	//const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=to:${activeUser.email}%20AND%20from:Info@blsinternational.com&orderBy=internalDate%20desc`;
	//const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=in:inbox&orderBy=internalDate%20desc`;
	//const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=to:${email}&orderBy=internalDate%20desc`;
	const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(`"${email}"`)}&maxResults=1`;


	try {
		const response = await fetch(apiUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${await getAccessToken()}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		} else {
			const data = await response.json();
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

export async function getEmailContent(account, current_Date) {
	try {
		var id = await getLastEmailId(account);
		const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`;

		const response = await fetch(apiUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${await getAccessToken()}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			// handelRequestError(500);
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		const emailDate = new Date(data.payload.headers.find((element) => element.name === "Date").value);

		if (current_Date - emailDate < 0) {
			await getEmailContent(account);
		} else {
			let bodybase64 = data.payload.body.data;
			let decodedEmailBody = decodeBase64HTML(bodybase64);
			let otpmatch = decodedEmailBody.split("below")[1].match(/\d{6}/);

			console.log("OTP inside getEmailContent: ", `'${otpmatch[0]}'`, "date: ", emailDate, "current_Date: ", current_Date);

			const otp = otpmatch[0];
      return otp;
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}
}