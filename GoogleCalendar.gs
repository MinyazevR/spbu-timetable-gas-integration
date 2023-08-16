//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Ссылка на исходник скрипта: https://script.google.com/d/1Vos3LjIA47jzbv6A6SKkvc-N-Us-_iWMWJvrRUEBI7wfXhjC-J7Wt5sS/edit?usp=sharing

// Вставьте сюда свой id(id преподавателя или группы) с timetable(Ваш id --- 2690, можно не менять)
var timetableId = '1111'

// Если вы получаете расписание преподавателя, укажите USERTYPE = 'educators', иначе смените USERTYPE = 'groups'
var USERTYPE = 'educators' 

// Создайте новый гугл календарь и поместите сюда его идентификатор вида (его можно получить в гугл календаре в "Настройка и общий доступ")
var calendarIdentificator = '***********************************@group.calendar.google.com'

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
  // выгружаться будет с текущего момента(будет просто new Date()) и на месяц вперед, но так как пока за последний месяц выгружать нечего, то с февраля
  var now = new Date()
  nowStr = now.toISOString().slice(0, 10)

  // Получаем дату 30+ дней
  var rightDate = new Date(now)
  rightDate.setDate(rightDate.getDate() + 30)
  rightDateStr = rightDate.toISOString().slice(0, 10)

  var res = UrlFetchApp.fetch(`https://timetable.spbu.ru/api/v1/${USERTYPE}/${timetableId}/events/${nowStr}/${rightDateStr}`)
  var dct = JSON.parse(res);

  // Получаем календарь
  var calendar = CalendarApp.getCalendarById(calendarIdentificator)

  // Получаем события за последний месяц
  var requests = calendar.getEvents(now, rightDate).map(event => (
    {url: `https://www.googleapis.com/calendar/v3/calendars/${calendarIdentificator}/events/${event.getId().replace("@google.com", "")}`,
    headers: {Authorization: "Bearer " + ScriptApp.getOAuthToken()}, 
    method: "DELETE"}))

  Logger.log(`Количество событий для удаления: ${requests.length}`)

  handler(requests)

  Logger.log('События успешно удалены')

  var postRequests = []

  var events_days = (USERTYPE == 'educator') ? dct['EducatorEventsDays'] : dct['Days']

  events_days.forEach(event => {
    var day_study_events = event['DayStudyEvents']
    day_study_events.forEach(day_event => {
      var start = day_event['Start']
      var startDate = new Date(start)
      var end = day_event['End']
      var endDate = new Date(end)
      var subject = day_event['Subject']
      var location = day_event['LocationsDisplayText']
      var groups_or_educator_names = (USERTYPE == 'educator') ? day_event['ContingentUnitName'] : day_event['EducatorsDisplayText']
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

  handler(postRequests)

  Logger.log('События успешно добавлены')
}
