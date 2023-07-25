//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Вставьте сюда свой id с timetable(Ваш id --- 2690, можно не менять)
var timetableId = '2690'

// Csv файл с расписанием с февраля 2023(который будет на автокоммите)
var actualCsvUrl = 'https://raw.githubusercontent.com/MinyazevR/timetable/main/CSV/SpecialEvents.csv'

// Создайте новый гугл календарь и поместите сюда его идентификатор вида (его можно получить в гугл календаре в "Настройка и общий доступ")
var calendarIdentificator = '*****************************@group.calendar.google.com'

// ВЫПОЛНИТЕ ФУНКЦИЮ createTimeTrigger() (запуск каждые 6 часов). Если Вы хотите настроить частоту выполнения сами, можно это сделать в панели слева(вкладка триггеры) 
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function createTimeTrigger() {
  ScriptApp.newTrigger('getTimetableEvents')
        .timeBased()
        .everyHours(6)
        .create()
}

function handler(requests) {
  // if limit > 2 then rateLimitExceeded
  var limit = 2
  var numberForDelete = Math.ceil(requests.length / limit)
  //var delay = 200
  for (let k = 0; k < numberForDelete + 1; k++) {
    var bound = Math.min(requests.length, (k + 1) * limit)
    var slice = requests.slice(k * limit, bound)
    var res = UrlFetchApp.fetchAll(slice)
    // try {
    //  var res = UrlFetchApp.fetchAll(slice);
    // } catch(e) {
    // if (delay <= 1000* 8) {
    //   Utilities.sleep(delay);
    //   delay *= 2
    //   k -= 1
    //   }
    // else {
    //   var res = UrlFetchApp.fetchAll(slice);
    //   }
    // }
  }
}


function getTimetableEvents() {
  var res = UrlFetchApp.fetch(actualCsvUrl)
  var csvraw = res.getContentText()
  var csv = Utilities.parseCsv(csvraw)

  // выгружаться будет с текущего момента(будет просто new Date()) и на месяц вперед, но так как пока за последний месяц выгружать нечего, то с февраля
  var fakeNow = new Date('2023-02-13 00:00:00')

  // Получаем нужную выборку (нужный id + последний месяц)
  var userEventsForLastMonth = csv.filter(item => item[0] == timetableId && (new Date(item[2])) >= fakeNow)

  // Получаем календарь
  var calendar = CalendarApp.getCalendarById(calendarIdentificator)

  // Получаем дату 30+ дней
  var now = new Date()
  var rightDate = new Date(now)
  rightDate.setDate(rightDate.getDate() + 30)

  // Получаем события за последний месяц(на данный момент с февраля, так как за посл месяц ничего не было)
  var requests = calendar.getEvents(fakeNow, rightDate).map(event => (
    {url: `https://www.googleapis.com/calendar/v3/calendars/${calendarIdentificator}/events/${event.getId().replace("@google.com", "")}`,
    headers: {Authorization: "Bearer " + ScriptApp.getOAuthToken()}, 
    method: "DELETE"}))

  Logger.log(`Количество событий для удаления: ${requests.length}`)

  handler(requests)

  Logger.log('События успешно удалены')

  var postRequests = []

  // Добавляем обновленные события за последний месяц
  for (let i = 0; i < userEventsForLastMonth.length ; i++) {
    var text = userEventsForLastMonth[i][5]
    var start_time = userEventsForLastMonth[i][2]
    var end_time = userEventsForLastMonth[i][3]
    var location = userEventsForLastMonth[i][4]
    var description = userEventsForLastMonth[i][6]
    var formData = {
    "summary": text,
    "description": description,
    "location": location,
    "start": {
      "dateTime": new Date(start_time),
    },
    "end": {
      "dateTime": new Date(end_time),
    }}

    var paramsForPost = {
      url: `https://www.googleapis.com/calendar/v3/calendars/${calendarIdentificator}/events`,
      headers: {Authorization: "Bearer " + ScriptApp.getOAuthToken()}, 
      muteHttpExceptions: true,
      method:"POST",
      payload: JSON.stringify(formData)};

    postRequests.push(paramsForPost)
  }

  handler(postRequests)

  Logger.log('События успешно добавлены')
}
