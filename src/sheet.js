var code = "4/0AeaYSHCUfqtbTLZ1zmnvUP7CXB1wYDihvrufF3bAuVLjcpP7tp01jVHJ7B7lHs9WuUP4ug";
var client_secret = "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";
var client_id = "622553297148-6trrbtgs59p1jq7q121vkbsv17bs33us.apps.googleusercontent.com";
var refresh_token = "1//03200GfjjA9YXCgYIARAAGAMSNwF-L9IrIFOk7PgbOjkFRMbqJIQsiT4mZwtZ8ykkHUPWlyMrq8-cMAtzwb4pb7Zugv32CQQLzeo";
const spreadsheetId = "1mGtrkcf2U3PqB5_2I1umdlSjUwIH54-kYPcgptmexRM";
const range = "BLS!A1:Z";
const rangeBLS = "BLS!A1:AE";
const rangeBLS_RAM = "BLS_FAM!A1:AI";

async function getAccessToken() {
    const response = await fetch("https://www.googleapis.com/oauth2/v4/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `client_id=${client_id}&client_secret=${client_secret}&refresh_token=${refresh_token}&grant_type=refresh_token`,
    });

    const data = await response.json();
    return data.access_token;
}

async function fetchSheetDataIndivual(accessToken, spreadsheetId, range) {
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const { values } = await response.json();
    const headers = values.shift(); // Remove the header row
    const jsonData = values.map((row) => {
        let obj = {};
        headers.forEach((header, index) => {
            const key = header.replace(/\s+/g, "_").toUpperCase();
            obj[key] = row[index];
        });
        return obj;
    });

    var filteredData = jsonData.filter((row) => {
        return row.OP_STATUS == "ACCOUNT CREATED" && row.DISTINATION == "PORTUGAL";
    });
    const formatDate = (dateString) => dateString.split("/").reverse().join("-");

    filteredData.forEach((obj) => {
        if (obj.CENTER === "TANGER") {
            obj.CENTER = "TANGIER";
        }
        if (obj.VISA_SUB_CATEGORY === "SCHENGEN_VISA_CAS2") {
            obj.VISA_SUB_CATEGORY = "SCHENGEN_VISA_EXISTING";
        } else if (obj.VISA_SUB_CATEGORY === "SCHENGEN_VISA_CAS1") {
            obj.VISA_SUB_CATEGORY = "SCHENGEN_VISA";
        }
        obj.BIRTH_DATE = formatDate(obj.BIRTH_DATE);
        obj.PASSPORT_ISSUE_DATE = formatDate(obj.PASSPORT_ISSUE_DATE);
        obj.PASSPORT_EXPIRY_DATE = formatDate(obj.PASSPORT_EXPIRY_DATE);
    });

    return filteredData;
}

async function getAccounts() {
    try {
        const accessToken = await getAccessToken();
        const sheetData = []
        var sheetDataIND = await fetchSheetDataIndivual(
            accessToken,
            spreadsheetId,
            rangeBLS
        );
        sheetDataIND.forEach((row) => {
            data = {
                "center": row.CENTER,
                "email": row.BLS_LOGIN,
                "password": row.BLS_PASSWORD,
                "FirstName": row.FIRST_NAME,
                "LastName": row.LAST_NAME,
                "DateOfBirth": row.BIRTH_DATE,
                "IssueDate": row.PASSPORT_ISSUE_DATE,
                "ExpiryDate": row.PASSPORT_EXPIRY_DATE,
                "IssuePlace": row.PASSPORT_ISSUE_PLACE,
                "PassportNo": row.PASSPORT_NO,
                "PlaceOfBirth": "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
                "NationalityId": "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
                "PassportType": "0a152f62-b7b2-49ad-893e-b41b15e2bef3",
                "IssueCountryId": "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
            };
            sheetData.push(data);
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

getAccounts();