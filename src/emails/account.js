const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.EMAIL_KEY)

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to:email,
        from: "kiranvegeta.1@gmail.com",
        subject:"Welcome to Task Manager App",
        text:`Welcome to the Task Manager App ${name}`
    })
}

const sendCancellationMail = (email, name) => {
    sgMail.send({
        to:email,
        from: "kiranvegeta.1@gmail.com",
        subject:`Goodbye ${name}` ,
        text:`Sorry that you did'nt like our services.`
    })
}

module.exports = {
    sendWelcomeMail,
    sendCancellationMail
}