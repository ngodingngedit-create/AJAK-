const fs = require('fs');

fetch('https://api.kolektix.my.id/api/shuttle-order')
  .then(res => res.json())
  .then(data => {
    if (data.success && data.data && data.data.data.length > 0) {
      fs.writeFileSync('test_data.json', JSON.stringify(data.data.data[0], null, 2));
    }
  })
  .catch(console.error);
