const cssPrinting = `
/* Font Face */
@font-face {
  font-family: 'Battambang';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/khmer/battambang-v9-khmer-regular.eot?#iefix') format('embedded-opentype'),
    url('/fonts/khmer/battambang-v9-khmer-regular.woff2') format('woff2'),
    url('/fonts/khmer/battambang-v9-khmer-regular.woff') format('woff'),
    url('/fonts/khmer/battambang-v9-khmer-regular.ttf') format('truetype'),
    url('/fonts/khmer/battambang-v9-khmer-regular.svg#Battambang') format('svg'),local('Khmer OS Battambang');
}
@font-face {
  font-family: 'Moul';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/khmer/moul-v8-khmer-regular.eot?#iefix') format('embedded-opentype'),
  url('/fonts/khmer/moul-v8-khmer-regular.woff2') format('woff2'),
  url('/fonts/khmer/moul-v8-khmer-regular.woff') format('woff'),
  url('/fonts/khmer/moul-v8-khmer-regular.ttf') format('truetype'),
  url('/fonts/khmer/moul-v8-khmer-regular.svg#Moul') format('svg'),local('Khmer OS Muol');
}
@font-face {
  font-family: 'Bokor';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/khmer/bokor-v8-khmer-regular.eot?#iefix')
  format('embedded-opentype'),
  url('/fonts/khmer/bokor-v8-khmer-regular.woff2') format('woff2'),
  url('/fonts/khmer/bokor-v8-khmer-regular.woff') format('woff'),
  url('/fonts/khmer/bokor-v8-khmer-regular.ttf') format('truetype'),
  url('/fonts/khmer/bokor-v8-khmer-regular.svg#Bokor') format('svg'),local('Khmer OS Bokor');
}
@font-face {
  font-family: 'Fasthand';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/khmer/fasthand-v7-khmer-regular.eot?#iefix')
  format('embedded-opentype'),
  url('/fonts/khmer/fasthand-v7-khmer-regular.woff2') format('woff2'),
  url('/fonts/khmer/fasthand-v7-khmer-regular.woff') format('woff'),
  url('/fonts/khmer/fasthand-v7-khmer-regular.ttf') format('truetype'),
  url('/fonts/khmer/fasthand-v7-khmer-regular.svg#Fasthand') format('svg');
}


@font-face {
  font-family: 'Calibri';
  src: url('/fonts/report/Calibri.ttf') format('truetype');
}
/* content-regular - khmer */
@font-face {
  font-family: 'Content';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/khmer/content-v8-khmer-regular.eot'),
    url('/fonts/khmer/content-v8-khmer-regular.eot?#iefix') format('embedded-opentype'),
    url('/fonts/khmer/content-v8-khmer-regular.woff2') format('woff2'),
    url('/fonts/khmer/content-v8-khmer-regular.woff') format('woff'),
    url('/fonts/khmer/content-v8-khmer-regular.ttf') format('truetype'),
    url('/fonts/khmer/content-v8-khmer-regular.svg#Content') format('svg');
    /* Legacy iOS */
}

@font-face {font-family: "FF Double Digits";
  src: url("//db.onlinewebfonts.com/t/04c2283fcaf31bc4ac07579245822eb5.eot");
  src: url("//db.onlinewebfonts.com/t/04c2283fcaf31bc4ac07579245822eb5.eot?#iefix") format("embedded-opentype"),
  url("//db.onlinewebfonts.com/t/04c2283fcaf31bc4ac07579245822eb5.woff2") format("woff2"),
  url("//db.onlinewebfonts.com/t/04c2283fcaf31bc4ac07579245822eb5.woff") format("woff"),
  url("//db.onlinewebfonts.com/t/04c2283fcaf31bc4ac07579245822eb5.ttf") format("truetype"),
  url("//db.onlinewebfonts.com/t/04c2283fcaf31bc4ac07579245822eb5.svg#FF Double Digits") format("svg"); }

  // En
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/kantumruy/Roboto-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  src: url('/fonts/kantumruy/Roboto-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  src: url('/fonts/kantumruy/Roboto-Bold.woff2') format('woff2');
}
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  src: url('/fonts/kantumruy/Roboto-Black.woff2') format('woff2');
}

/* Khmer font */
.kh-moul {
  font-family:'Roboto','Moul' !important;
}
.kh-battambang {
  font-family:'Roboto','Battambang' !important;
}
.kh-fasthand {
  font-family:'Roboto','Fasthand' !important;
}
.kh-bokor {
  font-family:'Roboto','Bokor' !important;
}

/* Paper Size */
.a4-p {
  width: 21cm
}

.a4-l {
  width: 29.7cm
}

.a5-p {
  width: 14.8cm
}

.a5-l {
  width: 21cm
}

.a6-p {
  width: 10.5cm
}

.a6-l {
  /* width: 14.8cm */
  width: 18.9cm /* Mr. Cheng */
}

.mini{
  width: 8cm
}

/* USE FOR PRINT INVOICE ONLY*/
.in-a4-p {
  width: 21cm;
}

.in-a4-l {
  width: 29.7cm;
}

.in-a5-p {
  width: 14.8cm;
}

.in-a5-l {
  width: 21cm;
}

.in-a6-p {
  width: 10.5cm !important;
}

.in-a6-l {
  width: 18.9cm;
}

.in-mini {
  width: 8cm;
}
/* END USE FOR PRINT INVOICE ONLY*/
/* Report Body */
.report-body {
  font-size: 12px !important;
  font-family: 'Roboto', Battambang !important;
}

/* Header */
.report-body .header {
  text-align: center;
  padding-bottom: 10px;
}

.report-body .header .company-name {
  font-size: 16px;
  font-weight: 400;
  padding-bottom: 0px;
}

.report-body .header .report-name {
  font-family: 'Roboto', Battambang !important;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  padding-bottom: 5px;
}

.report-body .header .report-period {
  font-family: 'Roboto', Battambang !important;
  font-size: 14px;
  font-weight: 500;
  padding-bottom: 5px;
}

/* Filter */
.report-body .filter {
  padding-bottom: 15px;
}

.report-body .filter .title {
  font-weight: 500;
  font-family: 'Roboto', Battambang !important;
}

/* Content */
.report-body .content {
  padding-bottom: 5px;
}

.report-body .table-content {
  font-family: 'Roboto', Battambang !important;
  font-size: 12px !important;
  border-collapse: collapse;
  width: 100%;
  margin-top: 20px;
  line-height: 23px;
}

.report-body .table-content th {
  border-bottom: 1px solid #ddd;
  padding: 5x 0px;
  background-color: #f5f7fa;
  text-align: left;
  text-transform: uppercase;
  line-height:1.5;
}

.report-body .table-content td {
  border-bottom: 1px solid #ddd;
  padding: 5px 0px;
  text-align: left;
  vertical-align: top;
  line-height:1.5;
}

.report-body .table-content tbody tr th {
  background-color: #fff !important;
}

/* Time Stamp */
.report-body .timestamp {
  font-size: 10px;
  font-weight: 300;
  font-style: italic;
  padding-bottom: 10px;
}

/* Footer */
.report-body .footer {
  font-size: 13px;
  padding-bottom: 10px;
}

.report-body .footer .title {
  font-weight: 600;
}

/* Signature */
.report-body .signature {
  padding-top: 20px;
  clear: both;
  text-align: center;
  font-weight: 500;
}

/* Note */
.report-body .note {
  border: 1px solid #2e2e2e;
  border-radius: 4px;
  font-weight: 500;
  -webkit-margin-start: 0px;
  -webkit-margin-end: 0px;
  margin-bottom: 22px;
  padding: 10px 15px
}

.report-body .note-textarea {
  text-align: right;
  margin: 0;
}

/* Grid */
.report-body .colspan-6 {
  flex-direction: column;
  width: 22%;
  float: left;
  flex:auto !important;
}

.report-body .colspan-8 {
  flex-direction: column;
  width: 30%;
  float: left;
  flex:auto !important;
}

.report-body .colspan-12 {
  flex-direction: column;
  width: 45%;
  float: left;
  flex:auto !important;
}

/* Text */
.text-left {
  text-align: left !important;
}
.text-right {
  text-align: right !important;
}
.text-center {
  text-align: center !important;
}
.text-bold {
  font-weight: bold
}
.text-italic {
  font-style: italic
}

.ra-text-left {
  text-align: left !important;
}
.ra-text-right {
  text-align: right !important;
}
.ra-text-center {
  text-align: center !important;
}
.ra-text-bold {
  font-weight: bold
}
.ra-text-italic {
  font-style: italic
}
.ra-text-underline {
  text-decoration-line: underline;
  text-decoration-style: solid;
}
.ra-text-dblunderline {
  text-decoration-line: underline;
  text-decoration-style: double;
}

/* Text transform */
.ra-text-capital {
  text-transform: capitalize;
}
.ra-text-lower {
  text-transform: lowercase;
}
.ra-text-upper {
  text-transform: uppercase;
}

/* Word break */
.ra-break-all {
  word-break: break-all;
}
.ra-break-work {
  word-break: break-word;
}

/* Set Margin To Logo Invoice */
.logo-img {
  margin-top: -22px !important;
}

/* Set Margin To Company Name Invoice */
.com-name{
  margin-top: -22px !important;
}


/* width 48mm for 34mm x 20mm */
.barcode-p{
  width:50mm
}

/*USE FOR PRINT INVOICE TEMPLATE*/
.template-text-right{
  text-align:right !important;
  padding-right:2px !important;
}
.template-text-left{
  text-align:left !important;
  padding-left:2px !important;
}
.template-text-center{
  text-align:center !important;
}

/* USE FOR BREAK TEXT INVOICE  TEMPLATE (HEADER, FILTER AND FOOTER TABLE)*/
.table-content-invoice  table, th, td {
  line-height: 1.5 !important;
  padding: 5px 0px;
}
.head-pre-line {
  white-space: pre-line !important;
  /*margin-top: -12px !important;*/
  line-height: 1.5 !important;
  padding: 2px 0px;
}
.show-note table{
  padding:5px 0px;
}
.show-note table th {
  text-align: left !important;
  border-collapse: collapse;
  border: 1px solid grey;
  padding:7px;
}

.show-description table {
  border-spacing: 0;
  margin-bottom: 5px;
  margin-top: 3px;
}
.show-description table th {
  text-align: center !important;
  border-collapse: collapse;
  border: 1px solid black;
  padding: 2px 7px 0 7px;
  border-right: 0;
  line-height: 1.5;
}
.show-description table th:last-child {
  border-right: 1px solid black;
}
.show-description {
  display: inline-flex;
}
.show-description > p {
  padding: 3px 5px 0 0;
}
`

export default cssPrinting
