document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //send or reply mail
  document.querySelector('#mail-form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#email-contain').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_mail(){
  console.log(document.querySelector('#compose-recipients').value);
  console.log(document.querySelector('#compose-subject').value);
  console.log(document.querySelector('#compose-body').value);
  fetch('/emails' , {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result); 
  });
  load_mailbox('sent');
}

function load_mailbox(mailbox) {
  localStorage.clear();
  document.querySelector("#mail-list").innerHTML = '';

  // Show the mailbox and hide other views
  document.querySelector('#mailbox-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-contain').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load the mailbox
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      console.log(email);
      const data = document.createElement('div');
      data.setAttribute("class", "email-box");

      // read and unread email background
      if (email.read == true) 
        data.setAttribute("class", "email-box-grey email-box")

      // contain of mail show.
      data.innerHTML = `
      Subject: ${email.subject}
      <br>
      From: ${email.sender}
      <br>
      <div id="mail-time">${email.timestamp}</div>`;

      data.addEventListener('click', () => load_email(email['id'], mailbox));      
      document.querySelector("#mail-list").append(data);
    });
  });

}


function load_email(id, mailbox) {
  localStorage.clear();
  
  // show the email and hide other view
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-contain').style.display = 'block';

  document.querySelector("#reply-btn").style.display = "block";
  document.querySelector("#email-reply").style.display = "none";

  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {
    // contain of mail show.
    document.querySelector("#email-data").innerHTML = `
    <b>From:</b> ${email.sender}
    <br>
    <b>To:</b> ${email.recipients}
    <br>
    <b>Subject:</b> ${email.subject}
    <br>
    <div id="mail-time">${email.timestamp}</div>`;
    document.querySelector("#email-body").innerHTML = email.body;

    // pre-filling the reply form
    document.querySelector(".rpl-recipients").value = email.sender;
    if ((email.subject).split(":")[0] !=  "Re") {
      document.querySelector(".rpl-subject").value = `Re: ${email.subject}`;
    }
    else {
      document.querySelector(".rpl-subject").value = `${email.subject}`;
    }
    document.querySelector(".rpl-body").value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}\n--------------\n`;
    
    // archive unarchive mail
    // don't show archived button to the sent email.
    if (mailbox === 'sent') 
      document.querySelector("#arc-btn").style.display = 'none';
    else
      document.querySelector("#arc-btn").style.display = 'block';

    // add function to the archive button
    document.querySelector("#arc-btn").innerHTML = !email['archived'] ? 'Archive' : 'Unarchive';
    document.querySelector("#arc-btn").addEventListener('click', (event) => {
      event.preventDefault();
      fetch('/emails/' + id, {
        method: 'PUT',
        body: JSON.stringify({
        archived: !email.archived
        })
      });
      load_mailbox('inbox'); 
    });
  });  
    
  // mark the mail as read as it is opened.
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });

  // reply email
  document.querySelector("#reply-btn").addEventListener('click', () => {
    document.querySelector("#reply-btn").style.display = "none";
    document.querySelector("#email-reply").style.display = "block";
  });
}