//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Ссылка на исходник скрипта: https://script.google.com/d/1sHXpwgmHZTU2e77Le349Sfx5GCYWBMDQH8OegJXsLu49PeIZIJemXNb0/edit?usp=sharing

// Вставьте сюда свой id с timetable(Ваш id --- 2690, можно не менять)
var timetableId = '2690'

// Не знаю, насколько разумно не скрывать client_id, но его наличие не дает возможности получения токенов доступа или получения токенов, выданных когда-либо этому client_id
var clientID = 'ddb39de3ae3340c5a4ef5f1666e24099'

// Перейдите по ссылке https://oauth.yandex.ru/authorize?response_type=token&client_id=ddb39de3ae3340c5a4ef5f1666e24099 и скопируйте свой access token в строке запроса

// Вставьте сюда свой access token
var token = ''

// Создайте новый яндекс календарь и поместите сюда его caldav url
var calendarUrl = 'https://caldav.yandex.ru/*****************************************'

// Csv файл с расписанием с февраля 2023(который будет на автокоммите)
var actualCsvUrl = 'https://raw.githubusercontent.com/MinyazevR/timetable/main/CSV/SpecialEvents.csv'

// ВЫПОЛНИТЕ ФУНКЦИЮ createTimeTrigger() (запуск каждые 6 часов). Если Вы хотите настроить частоту выполнения сами, можно это сделать в панели слева(вкладка триггеры) 
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function createTimeTrigger() {
  ScriptApp.newTrigger('getTimetableEvents')
        .timeBased()
        .everyHours(6)
        .create()
}

host = "https://caldav.yandex.ru"

function getTimetableEvents() {
  var res = UrlFetchApp.fetch(actualCsvUrl)
  var csvraw = res.getContentText()
  var csv = Utilities.parseCsv(csvraw)

  // выгружаться будет с текущего момента(будет просто new Date()) и на месяц вперед, но так как пока за последний месяц выгружать нечего, то с февраля
  var fakeNow = new Date('2023-02-13 00:00:00')

  // Получаем нужную выборку (нужный id + последний месяц)
  var userEventsForLastMonth = csv.filter(item => item[0] == timetableId && (new Date(item[2])) >= fakeNow)
  var params = {
    client_id: clientID,
    headers: {Authorization: `OAuth ${token}`},
    method: "GET"
  }

  var resp = UrlFetchApp.fetch(calendarUrl, params)

  var icsList = resp.getContentText().split('\n')

  for (let i = 0; i < icsList.length; i++) {
    if (icsList[i] == '$' || icsList[i] == '') {
      continue
    }
    var icsText = UrlFetchApp.fetch(host + icsList[i], params).getContentText()
    var datePart = icsText.split('BEGIN:VEVENT')[1].split('\n').map(x => x.split(':'))
    for (let j = 0; j < datePart.length; j++) {
      if (datePart[j][0] == 'DTSTART' || datePart[j][0] == 'DTSTART;VALUE=DATE') {
        var startTime = Utilities.parseDate("20230330T141000Z","GMT", "yyyyMMdd'T'HHmmss'Z'")
        if (startTime >= fakeNow) {
          UrlFetchApp.fetch(host + icsList[i], {
            client_id: clientID,
            headers: {Authorization: `OAuth ${token}`},
            method: "DELETE"
          })
          break
        }
      }
    }
  }
  for (let i = 0; i < userEventsForLastMonth.length; i++) {
    var text = userEventsForLastMonth[i][5]
    var startTime = userEventsForLastMonth[i][2]
    var endTime = userEventsForLastMonth[i][3]
    var location = userEventsForLastMonth[i][4]
    var description = userEventsForLastMonth[i][6]
    var str = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:${Utilities.formatDate(new Date(startTime), "GMT", "yyyyMMdd'T'HHmmss'Z'")}
DTEND:${Utilities.formatDate(new Date(endTime), "GMT", "yyyyMMdd'T'HHmmss'Z'")}
DESCRIPTION:${description}
LOCATION:${location}
SUMMARY:${text}
END:VEVENT
END:VCALENDAR`
    UrlFetchApp.fetch(calendarUrl + ' ', {
    client_id: clientID,
    headers: {Authorization: `OAuth ${token}`,
    'Content-type': 'text/calendar'},
    method: "PUT",
    payload: str,
    muteHttpExceptions: true
    })
  }
}
