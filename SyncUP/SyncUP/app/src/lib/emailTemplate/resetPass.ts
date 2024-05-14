export const resetPasswordTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body>
    <p>Hi {{name}},</p>
    <p>We've received a request to reset password. To proceed, please click on the link below:</p>
    <p><a href="{{url}}">Reset Password</a></p>
    <p>Thank you,<br>SyncUP Team</p>
</body>
</html>

`
