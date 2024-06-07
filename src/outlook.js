import { simpleParser } from 'mailparser';
import Imap from 'imap';

function fetchEmails() {
    const imapConfig = {
        user: process.env.OUTLOOK_EMAIL,
        password: process.env.OUTLOOK_PASSWORD,
        host: 'outlook.office365.com',
        port: 993,
        tls: true
    };
    const imap = new Imap(imapConfig);
    const date = new Date();
    imap.once('ready', function() {
        imap.openBox('INBOX', true, function(err, box) {
            if (err) {
                console.error(err);
                return;
            }
            imap.search(['ALL'], function(err, results) {
                if (err) {
                    console.error(err);
                    return;
                }
                const fetch = imap.fetch(results, { bodies: '' });

                fetch.on('message', function(msg, seqno) {
                    msg.on('body', function(stream, info) {
                        simpleParser(stream, {}, (err, parsed) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            if(parsed.subject.includes('BLS Visa Appointment - Email Verification')) {
                                const sexCode = parsed.text.split('below')[1].split('\n')[1];
                                console.log('sex code:', sexCode);
                            }
                        });
                    });
                });

                fetch.once('end', function() {
                    imap.end();
                });
            });
        });
    });

    imap.once('error', function(err) {
        console.error(err);
    });

    imap.connect();
}

fetchEmails();
