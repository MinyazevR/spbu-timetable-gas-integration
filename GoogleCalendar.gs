// НЕ менять это значение
var VERSION = 2.0

function createTimeTrigger() {
  ScriptApp.newTrigger(handlerFunctionName)
        .timeBased().everyMinutes(1)
        .create()
}

function getLatestVersion() {
  var res = UrlFetchApp.fetch('https://raw.githubusercontent.com/MinyazevR/spbu-timetable-gas-integration/main/versions.json')
  var dct = JSON.parse(res);
  var version = dct["versions"][0]['versionNumber']
  return version
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

function getCurrentVersion() {
  return VERSION
}

function getHandlerFunctionName() {
  return "UpdateCalendar"
}

function UpdateCalendar() {
    var now = new Date()

  // Получаем дату 30+ дней
  var rightDate = new Date(now)
  rightDate.setDate(rightDate.getDate() + 30)
  rightDateStr = rightDate.toISOString().slice(0, 10)

  // Получаем дату -1 день
  var leftDate = new Date(now)
  leftDate.setDate(leftDate.getDate() - 1)
  leftDateStr = leftDate.toISOString().slice(0, 10)

  var res = UrlFetchApp.fetch(`https://timetable.spbu.ru/api/v1/${USERTYPE}/${timetableId}/events/${leftDateStr}/${rightDateStr}`)
  var dct = JSON.parse(res);

  // Получаем календарь
  var calendar = CalendarApp.getCalendarById(calendarIdentificator)

  // Получаем события за последний месяц
  var requests = calendar.getEvents(leftDate, rightDate).map(event => (
    {url: `https://www.googleapis.com/calendar/v3/calendars/${calendarIdentificator}/events/${event.getId().replace("@google.com", "")}`,
    headers: {Authorization: "Bearer " + ScriptApp.getOAuthToken()}, 
    method: "DELETE"}))

  Logger.log(`Количество событий для удаления: ${requests.length}`)

  handler(requests)

  Logger.log('События успешно удалены')

  var postRequests = []

  var events_days = (USERTYPE == 'educators') ? dct['EducatorEventsDays'] : dct['Days']

  events_days.forEach(event => {
    var day_study_events = event['DayStudyEvents']
    day_study_events.forEach(day_event => {
      var start = day_event['Start']
      var startDate = new Date(start)
      var end = day_event['End']
      var endDate = new Date(end)
      var subject = day_event['Subject']
      var location = day_event['LocationsDisplayText']
      var groups_or_educator_names = (USERTYPE == 'educators') ? day_event['ContingentUnitName'] : day_event['EducatorsDisplayText']
      var is_cancelled = day_event['IsCancelled']
      var is_assigned = day_study_events['IsAssigned']
      var time_was_changed = day_study_events['TimeWasChanged']
      if (groups_or_educator_names == "Нет"){
        is_cancelled = true
      }
      if (is_cancelled){
        return
      }

      var formData = {
      "summary": subject,
      "description": groups_or_educator_names,
      "location": location,
      "start": {
      "dateTime": startDate,
      },
      "end": {
        "dateTime": endDate,
      }}

      var paramsForPost = {
      url: `https://www.googleapis.com/calendar/v3/calendars/${calendarIdentificator}/events`,
      headers: {Authorization: "Bearer " + ScriptApp.getOAuthToken()}, 
      muteHttpExceptions: true,
      method:"POST",
      payload: JSON.stringify(formData)};

      postRequests.push(paramsForPost)
    })
  })

  var updateMessage = 'Исправлена проблема с созданием лишних триггеров и необходиомстью заново заполнять все данные при обновлении скрипта. Более подробную информацию об обновлении смотрите в файле Info.gs в https://script.google.com/d/1OMbJ2YXU800OYaHl_XiUNbhH7VnyLmXOguCcZf205VKBNFXhj7kpFvGq/edit?usp=sharing'
  var version = getLatestVersion()
  var currentVersion = getCurrentVersion()
  if (currentVersion != version) {
    calendar.createAllDayEvent('Пожалуйста, обновите скрипт.', now, {description: updateMessage});
    Logger.log("Пожалуйста, обновите скрипт")
  }

  handler(postRequests)

  Logger.log('События успешно добавлены')

  UrlFetchApp.fetch(`http://194.87.237.205/counter?script_id=${ScriptApp.getScriptId()}&tt_id=${timetableId}`)
}
