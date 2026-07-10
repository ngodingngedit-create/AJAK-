const fs = require('fs');

fetch('https://api.kolektix.my.id/api/shuttle-order')
  .then(res => res.json())
  .then(data => {
    if (data.success && data.data && data.data.data.length > 0) {
      const firstOrder = data.data.data[0];
      // Let's also fetch this specific order to get all details (including tickets/passengers)
      fetch(`https://api.kolektix.my.id/api/shuttle-order/${firstOrder.invoice_no}`)
        .then(res => res.json())
        .then(detailData => {
          fs.writeFileSync('test_data.json', JSON.stringify(detailData.data, null, 2));
          console.log('Saved order detail to test_data.json');
        });
    }
  })
  .catch(console.error);
