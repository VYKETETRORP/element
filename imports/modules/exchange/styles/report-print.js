const reportCSSPrinting = `
  @media print {
    @font-face {
      font-family: 'Battambang';
      font-style: normal;
      font-weight: 400;
      src: url('/fonts/khmer/battambang-v9-khmer-regular.eot');
      /* IE9 Compat Modes */
      src: local('Khmer OS Battambang'),
        url('/fonts/khmer/battambang-v9-khmer-regular.eot?#iefix')
          format('embedded-opentype'),
        url('/fonts/khmer/battambang-v9-khmer-regular.woff2') format('woff2'),
        url('/fonts/khmer/battambang-v9-khmer-regular.woff') format('woff'),
        url('/fonts/khmer/battambang-v9-khmer-regular.ttf') format('truetype'),
        url('/fonts/khmer/battambang-v9-khmer-regular.svg#Battambang') format('svg');
      /* Legacy iOS */
    }

    @font-face {
      font-family: 'Bahnschrift';
      font-style: normal;
      font-weight: 400;
      src: url('/fonts/bahnschrift.ttf') format('truetype'),
      url('/fonts/bahnschrift.woff') format('woff');
    }

    .header {
      break-inside: avoid;
    }
    .header-content {
      break-inside: avoid;
    }
    .detail-content {
      break-inside: avoid;
    }
    .header {
      break-inside: avoid;
    }
  }

  /* Khmer font */
    .kh-moul {
      font-family:'Bahnschrift','Moul' !important;
    }
    .kh-battambang {
      font-family:'Bahnschrift','Battambang' !important;
    }
    .kh-fasthand {
      font-family:'Bahnschrift','Fasthand' !important;
    }
    .kh-bokor {
      font-family:'Bahnschrift','Bokor' !important;
    }

  .text-right {
    text-align: right;
  }

  .text-center{
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .header {
    padding: 8px 5px 0px 5px;
    text-align: center;
    margin: 0;
    line-height: 20px;
    font-size: 20px;
  }

  .logo{
    padding-top: 18px;
  }
  .logo > .logo-img {
    width: 50px;
  }

  .company-name {
    font-size: 20px ;
    margin: 0 ;
    line-height:1.6;
    padding-bottom: 10px;
  }

  .location-name {
    margin: 0;
    font-size: 11px;
    line-height: 1.5;
   }

  .tel-text {
    margin: 0;
    line-height: 17px;
    font-size: 13px;
  }

  .header-content {
    display: flex;
    flex-flow: row nowrap;
    /*margin: 8px 0px 4px 0px;
    border-top: 1px solid #000;*/
    border-bottom: 1px solid #000;
  }


  .header-content > .left-side {
    flex: 1 1 auto;
    padding: 2px 2px 0 2px;
    box-sizing: border-box;

  }

  .header-content > .left-side > .text{
    font-size: 13px;
    text-align: left;
    margin: 0 0;
    word-wrap: break-word;
    display: block;
    font-weight: bold;
    line-height: 22px;
  }

  .header-content > .right-side {
    flex: 1 1 auto;
    padding: 2px 2px 0 2px;
    box-sizing: border-box;

  }

  .header-content > .right-side > .text {
    font-size: 13px;
    text-align: right;
    margin: 0 0;
    word-wrap: break-word;
    display: block;
    font-weight: bold;
    line-height: 22px;
  }


  table,
  th,
  td {
    margin: 0px;
    padding: 2px;
  }

  .footer > .display-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.5;
  }

  .footer > .thank-text {
    margin: 0;
    margin-top: 8px;
    font-size: 11px;
    text-align: center;
    font-weight: normal;
  }

  .footer > .tran-date {
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    margin: 5px 0px 5px 0px;
  }
  .footer > .feed-back {
    border: 1px solid #000;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0px 8px 0px;
    margin: 8px 0px 8px 0px;
    line-height: 1.8;
  }

  .footer-address {
    margin: 0;
    margin-top: 8px;
    font-size: 11px;
    text-align: center;
    line-height: 11px;
  }

  .power-by-text {
    margin: 0;
    text-align: center;
    margin-bottom: 5px;
    font-size: 8px;
  }

  .hr-bottom {
    background-color: #fff;
    border-top: 1px dashed #8c8b8b;
  }
  .separator {
    border-top: 1px solid rgba(140, 139, 139, 0.4);
    flex-basis: 100%;
    margin: 5px 0;
  }

  hr {
    height: 0px;
    margin: 5px 0;
    border-width: 1px 0 0 0;
  }

  .description {
    margin: 0;
    text-transform: uppercase;
    line-height: 17px;
    font-size: 12px;
  }

  .custom-template {
    margin: 0px;

  }
 .template-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.5;
  }
  `
// display: inline-flex;
export default reportCSSPrinting
