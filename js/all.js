let data;
let ary;
let latLog = [];
var map;
let c = 0;

function init() {
  getLocation();
  renderDay();  
}

init();

// 顯示資料用
function renderDay() {
  // 判斷日期
  let date = new Date();
  let day = date.getDay();
  let chineseDay = judgeDayChinese(day);

  // 顯示日期到網頁
  let thisDay = date.getFullYear() + '-' + changeMonth(date.getMonth()) + '-' + changeDay(date.getDate());
  document.querySelector('.jsDate span').textContent = chineseDay;
  document.querySelector('h3').textContent = thisDay;

  // 判斷奇數偶數，並顯示可以購買的民眾
  if (day === 1 || day === 3 || day === 5) {
    document.querySelector('.odd').style.display = 'block';
  } else if (day === 2 || day === 4 || day === 6) {
    document.querySelector('.even').style.display = 'block';
  } else {
    document.querySelector('.other').style.display = 'block';
  }
}

//get JSON Data
function getData() {
  let xhr = new XMLHttpRequest();
  xhr.open('get', "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
  xhr.send();
  xhr.onload = function () {
    data = JSON.parse(xhr.responseText);
    ary = data.features;

    setCityOption();
    //預設顯示高雄市
    document.querySelector('.city').value = '高雄市';
    setAreaOption('高雄市');
    renderList();

    map(latLog[0], latLog[1]);


    document.querySelector('.city').addEventListener('change', function (e) {
      setAreaOption(e.target.value);
      renderList();
    })

    document.querySelector('.area').addEventListener('change', function () {
      renderList();
      for (let i = 0; i < ary.length; i++) {
        if (document.querySelector('.city').value === ary[i].properties.county) {
          if (document.querySelector('.area').value === ary[i].properties.town) {
            console.log(ary[i].geometry.coordinates[0]);
            latLog[2] = ary[i].geometry.coordinates[1];
            latLog[3] = ary[i].geometry.coordinates[0];
            map.setView([latLog[2], latLog[3]], 16);
            break;
          }
        }
      }
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    })

    document.querySelector('.list').addEventListener('click', function (e) {
      if (e.target.nodeName === 'A') {
        for (let i = 0; i < ary.length; i++) {
          if (e.path[2].childNodes[3].innerHTML === ary[i].properties.address) {
            map.setView([ary[i].geometry.coordinates[1], ary[i].geometry.coordinates[0]], 18);
          }
        }
        // console.log(e.path[2].childNodes[3].innerHTML);
        // console.log(e);
      }
    })


  }
}

function renderList() {
  let city = document.querySelector('.city').value;
  let area = document.querySelector('.area').value;
  let str = ''
  for (let i = 0; ary.length > i; i++) {
    if (ary[i].properties.county === city && ary[i].properties.town === area) {
      str += `
        <li>
          <h2>${ary[i].properties.name}</h2>
          <p>${ary[i].properties.address}</p>
          <p>${ary[i].properties.phone}</p>
          <p>${ary[i].properties.note}</p>
          <div class="mask">
            <h3 class="adult">成人口罩<span>${ary[i].properties.mask_adult}</span></h3>
            <h3 class="child">兒童口罩<span>${ary[i].properties.mask_child}</span></h3>
            <a href="#" class="goLoc">前往</a>
          </div>
        </li>
        `;
    }
  }
  document.querySelector('.list').innerHTML = str;
}

function setCityOption() {
  let optionStr = '';
  let cityOption = [];
  for (let i = 0; i < ary.length; i++) {
    if (cityOption.indexOf(ary[i].properties.county) === -1) {
      cityOption.push(ary[i].properties.county);
    }
  }
  for (let i = 0; i < cityOption.length; i++) {
    if (cityOption[i] !== '') {
      optionStr += `
      <option value="${cityOption[i]}">${cityOption[i]}</option>
      `
    }
  }
  document.querySelector('.city').innerHTML = optionStr;
}

function setAreaOption(area) {
  let optionStr = '';
  let areaOption = [];
  for (let i = 0; i < ary.length; i++) {
    if (ary[i].properties.county === area) {
      if (areaOption.indexOf(ary[i].properties.town) === -1) {
        areaOption.push(ary[i].properties.town);
      }
    }
  }
  for (let i = 0; i < areaOption.length; i++) {
    if (areaOption[i] !== '') {
      optionStr += `
      <option value="${areaOption[i]}">${areaOption[i]}</option>
      `
    }
  }
  document.querySelector('.area').innerHTML = optionStr;

}

// 工具類 函式  輸入東西 > 輸出內容
function judgeDayChinese(day) {
  switch (day) {
    case 1:
      return "一"
      break;
    case 2:
      return "二"
      break;
    case 3:
      return "三"
      break;
    case 4:
      return "四"
      break;
    case 5:
      return "五"
      break;
    case 6:
      return "六"
      break;
    case 0:
      return "日"
      break;
  }
}

function changeMonth(month) {
  if (month < 9) {
    return '0' + (month + 1);
  } else {
    return month;
  }
}

function changeDay(day) {
  if (day < 10) {
    return '0' + day;
  } else {
    return day;
  }
}

//map
function map(lat, log) {

  map = L.map('map', {
    center: [lat, log],
    zoom: 16,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  let greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  let redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  let blueIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [36, 51],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  let markers = new L.MarkerClusterGroup().addTo(map);;
  for (let i = 0; i < ary.length; i++) {
    if (ary[i].properties.mask_adult === 0) {
      mask = redIcon;
    } else {
      mask = greenIcon;
    }
    markers.addLayer(L.marker([ary[i].geometry.coordinates[1], ary[i].geometry.coordinates[0]], { icon: mask }).bindPopup('<h1>' + ary[i].properties.name + '</h1><p>' + ary[i].properties.address + '</p><p>成人口罩 :' + ary[i].properties.mask_adult + '個</p>' + '</p><p>兒童口罩 :' + ary[i].properties.mask_child + '個</p>'));
  }
  markers.addLayer(L.marker([lat, log], { icon: blueIcon }).bindPopup('<h1>您的位置</h1>'));
  map.addLayer(markers);
}


//取得經緯度
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("您的瀏覽器不支援位置，請使用其它瀏覽器開啟口罩地圖");
  }
}
function showPosition(position) {
  // console.log("緯度:" + position.coords.latitude +
  //   "經度:" + position.coords.longitude);
  latLog[0] = position.coords.latitude;
  latLog[1] = position.coords.longitude;
  getData();
}



