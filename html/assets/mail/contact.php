<?php
$data = $_POST;
$to      = 'info@occadvisors.com.au';
$subject = 'New inquiry';
$message = ' 
<!DOCTYPE html>
<html lang="en">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>Inquiry!</title>
<style type="text/css">
body{
font-family: sans-serif;
}
#status {
width: 200px;
height: 200px;
position: absolute;
left: 50%;
/* centers the loading animation horizontally one the screen */

top: 50%;
/* centers the loading animation vertically one the screen */

background-image: url(../images/preloader.gif);
/* path to your loading animation */

background-repeat: no-repeat;
background-position: center;
margin: -100px 0 0 -100px;
/* is width and height divided by two */
}
.email-tem{
background: #efefef;
position: relative;
overflow: hidden;
}
.email-tem-inn{
width: 50%;
margin: 0 auto;
background: #ffffff;
/* margin-top: 50px; */
/* margin-bottom: 50px; */
}
.email-tem-main{background: #fdfdfd;box-shadow: 0px 10px 24px -10px rgba(0, 0, 0, 0.8);margin-bottom: 50px;border-radius: 10px;}
.email-tem-head{
width: 100%;
background: #fecc99;
padding: 50px;
box-sizing: border-box;
border-radius: 5px 5px 0px 0px;
}
.email-tem-head h2{
color: #3d3d3d;
font-size: 32px;
text-transform: capitalize;
}
.email-tem-head h2 img{
float: left;
padding-right: 25px;
width: 100px;
}
.email-tem-body{
padding: 30px 50px;
}
.email-tem-body h3{
margin-bottom: 25px;    
}
.email-tem-body p{
}
.email-tem-body a{
background: #0a993c;
color: #fff;
padding: 12px;
border-radius: 2px;
margin-top: 15px;
position: relative;
display: inline-block;
width: 200px;
text-align: center;
text-decoration: none;
}
.email-tem-foot{
text-align: center;
}
.email-tem-foot h4{
}
.email-tem-foot ul{
position: relative;
overflow: hidden;
margin: 0 auto;
display: table;
margin-bottom: 18px;
margin-top: 25px;
}
.email-tem-foot ul li{
float: left;
display: inline-block;
padding: 0px 10px;
}
.email-tem-foot ul li a{}
.email-tem-foot ul li a img{}
.email-tem-foot p{
margin-bottom: 0px;
padding-top: 5px;
font-size: 13px;
}
.email-point{
position: relative;
overflow: hidden;
width: 100%;
border-bottom: 1px solid #e6e6e6;
/* margin-bottom: 25px; */
padding-bottom: 15px;
padding-top: 20px;
}
.email-point-left{
float: left;
width: 20%;
}
.email-point-left img{
width: 100%;
padding: 0px 20px 0px 0px;
}
.email-point-righ{
float: left;
width: 80%;
}
.email-point-righ h4{
padding-bottom: 10px;
}
.email-point-righ p{
font-size: 13px;
margin-bottom: 15px;
}
.email-list{}
.email-list ul{
margin-bottom:0px;
}
.email-list ul li{
display:block;
font-size:14px;
}

.invoice {
position: relative;
overflow: hidden;
width: 100%;
border: 1px solid #eaedef;
}
.invoice:hover {
box-shadow: 0px 0px 50px 7px rgba(150, 150, 150, 0.8);
}
.invoice-1 {
padding: 50px;
}
.invoice-1-logo {
margin-bottom: 60px;
}
.invoice-1-logo img {} .invoice-1-logo span {
float: right;
text-transform: uppercase;
font-size: 50px;
font-family:  sans-serif;
color: #2a2b33;
font-weight: 700;
line-height: 35px;
}
.invoice-1-add {
position: relative;
overflow: hidden;
margin-bottom: 50px;
}
.invoice-1-add-left {
float: left;
width: 100%;
margin-bottom: 40px;
}
.invoice-1-add-left h3 {} .invoice-1-add-left p {} .invoice-1-add-left h5 {} .invoice-1-add-right {
float: left;
padding: 20px;
background: #fdfae9;
border-radius: 4px;
/* display: inline-block; */

width: 100%;
}
.invoice-1-add-right ul {
margin-bottom: 0px;
}
.invoice-1-add-right ul li {} .invoice-1-add-right ul li span {
float: left;
width: 50%;
color: #343c42;
}
.invoice-1-tab {} .invoice-1-tab table {} .invoice-1-tab table th {
text-transform: uppercase;
}
.email-tem-foot{
text-align: center;
}
.email-tem-foot h4{
}
.email-tem-foot ul{
position: relative;
overflow: hidden;
margin: 0 auto;
display: table;
margin-bottom: 18px;
margin-top: 25px;
}
.email-tem-foot ul li{
float: left;
display: inline-block;
padding: 0px 10px;
}
.email-tem-foot ul li a{}
.email-tem-foot ul li a img{}
.email-tem-foot p{
margin-bottom: 0px;
padding-top: 5px;
font-size: 13px;
}
.show-on-dekstop{
display: block;
}
.show-on-mobile{
display: none;
}
@media (max-width:460px){
.email-tem-inn {
width: 100% !important;
padding: 0px;
}
.show-on-dekstop{
display: none;
}
.show-on-mobile{
display: block;
}
.email-tem-head {

padding: 12px;
}
.email-tem-body {
padding: 20px;
}
}
table {
  background-color: transparent;
}
table col[class*="col-"] {
  position: static;
  display: table-column;
  float: none;
}
table td[class*="col-"],
table th[class*="col-"] {
  position: static;
  display: table-cell;
  float: none;
}
caption {
  padding-top: 8px;
  padding-bottom: 8px;
  color: #777777;
  text-align: left;
}
th {
  text-align: left;
}
.table {
  width: 100%;
  max-width: 100%;
  margin-bottom: 20px;
}
.table > thead > tr > th,
.table > tbody > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tbody > tr > td,
.table > tfoot > tr > td {
  padding: 8px;
  line-height: 1.42857143;
  vertical-align: top;
  border-top: 1px solid #dddddd;
}
.table > thead > tr > th {
  vertical-align: bottom;
  border-bottom: 2px solid #dddddd;
}
.table > caption + thead > tr:first-child > th,
.table > colgroup + thead > tr:first-child > th,
.table > thead:first-child > tr:first-child > th,
.table > caption + thead > tr:first-child > td,
.table > colgroup + thead > tr:first-child > td,
.table > thead:first-child > tr:first-child > td {
  border-top: 0;
}
.table > tbody + tbody {
  border-top: 2px solid #dddddd;
}
.table .table {
  background-color: #ffffff;
}
.table-condensed > thead > tr > th,
.table-condensed > tbody > tr > th,
.table-condensed > tfoot > tr > th,
.table-condensed > thead > tr > td,
.table-condensed > tbody > tr > td,
.table-condensed > tfoot > tr > td {
  padding: 5px;
}
.table-bordered {
  border: 1px solid #dddddd;
}
.table-bordered > thead > tr > th,
.table-bordered > tbody > tr > th,
.table-bordered > tfoot > tr > th,
.table-bordered > thead > tr > td,
.table-bordered > tbody > tr > td,
.table-bordered > tfoot > tr > td {
  border: 1px solid #dddddd;
}
.table-bordered > thead > tr > th,
.table-bordered > thead > tr > td {
  border-bottom-width: 2px;
}
.table-striped > tbody > tr:nth-of-type(odd) {
  background-color: #f9f9f9;
}
.table-hover > tbody > tr:hover {
  background-color: #f5f5f5;
}
.table > thead > tr > td.active,
.table > tbody > tr > td.active,
.table > tfoot > tr > td.active,
.table > thead > tr > th.active,
.table > tbody > tr > th.active,
.table > tfoot > tr > th.active,
.table > thead > tr.active > td,
.table > tbody > tr.active > td,
.table > tfoot > tr.active > td,
.table > thead > tr.active > th,
.table > tbody > tr.active > th,
.table > tfoot > tr.active > th {
  background-color: #f5f5f5;
}
.table-hover > tbody > tr > td.active:hover,
.table-hover > tbody > tr > th.active:hover,
.table-hover > tbody > tr.active:hover > td,
.table-hover > tbody > tr:hover > .active,
.table-hover > tbody > tr.active:hover > th {
  background-color: #e8e8e8;
}
.table > thead > tr > td.success,
.table > tbody > tr > td.success,
.table > tfoot > tr > td.success,
.table > thead > tr > th.success,
.table > tbody > tr > th.success,
.table > tfoot > tr > th.success,
.table > thead > tr.success > td,
.table > tbody > tr.success > td,
.table > tfoot > tr.success > td,
.table > thead > tr.success > th,
.table > tbody > tr.success > th,
.table > tfoot > tr.success > th {
  background-color: #dff0d8;
}
.table-hover > tbody > tr > td.success:hover,
.table-hover > tbody > tr > th.success:hover,
.table-hover > tbody > tr.success:hover > td,
.table-hover > tbody > tr:hover > .success,
.table-hover > tbody > tr.success:hover > th {
  background-color: #d0e9c6;
}
.table > thead > tr > td.info,
.table > tbody > tr > td.info,
.table > tfoot > tr > td.info,
.table > thead > tr > th.info,
.table > tbody > tr > th.info,
.table > tfoot > tr > th.info,
.table > thead > tr.info > td,
.table > tbody > tr.info > td,
.table > tfoot > tr.info > td,
.table > thead > tr.info > th,
.table > tbody > tr.info > th,
.table > tfoot > tr.info > th {
  background-color: #d9edf7;
}
.table-hover > tbody > tr > td.info:hover,
.table-hover > tbody > tr > th.info:hover,
.table-hover > tbody > tr.info:hover > td,
.table-hover > tbody > tr:hover > .info,
.table-hover > tbody > tr.info:hover > th {
  background-color: #c4e3f3;
}
.table > thead > tr > td.warning,
.table > tbody > tr > td.warning,
.table > tfoot > tr > td.warning,
.table > thead > tr > th.warning,
.table > tbody > tr > th.warning,
.table > tfoot > tr > th.warning,
.table > thead > tr.warning > td,
.table > tbody > tr.warning > td,
.table > tfoot > tr.warning > td,
.table > thead > tr.warning > th,
.table > tbody > tr.warning > th,
.table > tfoot > tr.warning > th {
  background-color: #fcf8e3;
}
.table-hover > tbody > tr > td.warning:hover,
.table-hover > tbody > tr > th.warning:hover,
.table-hover > tbody > tr.warning:hover > td,
.table-hover > tbody > tr:hover > .warning,
.table-hover > tbody > tr.warning:hover > th {
  background-color: #faf2cc;
}
.table > thead > tr > td.danger,
.table > tbody > tr > td.danger,
.table > tfoot > tr > td.danger,
.table > thead > tr > th.danger,
.table > tbody > tr > th.danger,
.table > tfoot > tr > th.danger,
.table > thead > tr.danger > td,
.table > tbody > tr.danger > td,
.table > tfoot > tr.danger > td,
.table > thead > tr.danger > th,
.table > tbody > tr.danger > th,
.table > tfoot > tr.danger > th {
  background-color: #f2dede;
}
.table-hover > tbody > tr > td.danger:hover,
.table-hover > tbody > tr > th.danger:hover,
.table-hover > tbody > tr.danger:hover > td,
.table-hover > tbody > tr:hover > .danger,
.table-hover > tbody > tr.danger:hover > th {
  background-color: #ebcccc;
}
.table-responsive {
  min-height: .01%;
  overflow-x: auto;
}
@media screen and (max-width: 767px) {
  .table-responsive {
    width: 100%;
    margin-bottom: 15px;
    overflow-y: hidden;
    -ms-overflow-style: -ms-autohiding-scrollbar;
    border: 1px solid #dddddd;
  }
  .table-responsive > .table {
    margin-bottom: 0;
  }
  .table-responsive > .table > thead > tr > th,
  .table-responsive > .table > tbody > tr > th,
  .table-responsive > .table > tfoot > tr > th,
  .table-responsive > .table > thead > tr > td,
  .table-responsive > .table > tbody > tr > td,
  .table-responsive > .table > tfoot > tr > td {
    white-space: nowrap;
  }
  .table-responsive > .table-bordered {
    border: 0;
  }
  .table-responsive > .table-bordered > thead > tr > th:first-child,
  .table-responsive > .table-bordered > tbody > tr > th:first-child,
  .table-responsive > .table-bordered > tfoot > tr > th:first-child,
  .table-responsive > .table-bordered > thead > tr > td:first-child,
  .table-responsive > .table-bordered > tbody > tr > td:first-child,
  .table-responsive > .table-bordered > tfoot > tr > td:first-child {
    border-left: 0;
  }
  .table-responsive > .table-bordered > thead > tr > th:last-child,
  .table-responsive > .table-bordered > tbody > tr > th:last-child,
  .table-responsive > .table-bordered > tfoot > tr > th:last-child,
  .table-responsive > .table-bordered > thead > tr > td:last-child,
  .table-responsive > .table-bordered > tbody > tr > td:last-child,
  .table-responsive > .table-bordered > tfoot > tr > td:last-child {
    border-right: 0;
  }
  .table-responsive > .table-bordered > tbody > tr:last-child > th,
  .table-responsive > .table-bordered > tfoot > tr:last-child > th,
  .table-responsive > .table-bordered > tbody > tr:last-child > td,
  .table-responsive > .table-bordered > tfoot > tr:last-child > td {
    border-bottom: 0;
  }
}
</style>

</head>

<body>

<section>
<div class="email-tem">
<div class="email-tem-inn">
<div class="email-tem-main">
    <div class="email-tem-head">
        <h2 style="margin: 0">' . $subject . '</h2>
    </div>
    
    <div class="email-tem-body">
        <table class="table table-striped">
            <tr>
                <th>Name</th>
                <td>' . $data['name'] . '</td>
            </tr>
            <tr>
                <th>Email</th>
                <td>' . $data['email'] . '</td>
            </tr>
            <tr>
                <th>Phone</th>
                <td>' . $data['phone'] . '</td>
            </tr>
            <tr>
                <th>Business</th>
                <td>' . $data['company_name'] . '</td>
            </tr>
			<tr>
                <th>Agent</th>
                <td>' . $data['agent'] . '</td>
            </tr>
			<tr>
                <th>Service</th>
                <td>' . $data['service-sel'] . '</td>
            </tr>
			<tr>
                <th>Message</th>
                <td>' . $data['message'] . '</td>
            </tr>
			<tr>
            </table>
    </div>
    <div class="" style="text-align:center;background: #000000;  padding: 10px;">
      <img src="https://occ.com/assets/media/logo.png" alt="" style="    width: 160px;
      margin: 10px 0;">
    </div>
</div>
<div class="email-tem-foot">
   
   
</div>
</div>
</div>
</section>
<!--END DASHBOARD-->

</body>

</html>';

// Create a boundary for the email
$boundary = "boundary";

// Attach the file to the email

// Headers for the email
$headers = "From: OCC <noreply@occ.com>\r\n";
$headers .= "Reply-To: noreply@occ.com\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
  $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
  $body = $message;




// Send email 
if (mail($to, $subject, $body, $headers)) {
  echo 'Email sent successfully.';
} else {
  echo 'Error sending email.';
}
