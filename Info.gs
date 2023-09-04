//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Ссылка на исходник скрипта: https://script.google.com/d/1Vos3LjIA47jzbv6A6SKkvc-N-Us-_iWMWJvrRUEBI7wfXhjC-J7Wt5sS/edit?usp=sharing

// github: https://github.com/MinyazevR/spbu-timetable-gas-integration

// Жалобы и вопросы можно писать в tg: https://t.me/Rerrrrwww, st094172@student.spbu.ru или открыть issue в https://github.com/MinyazevR/spbu-timetable-gas-integration

// Вставьте сюда свой id(id преподавателя или группы)
var timetableId = '334758'

// Если вы получаете расписание преподавателя, укажите USERTYPE = 'educators', иначе смените USERTYPE = 'groups'
var USERTYPE = 'groups' 

// Создайте новый гугл календарь и поместите сюда его идентификатор вида (его можно получить в гугл календаре в "Настройка и общий доступ")
var calendarIdentificator = '**************************************************@group.calendar.google.com'

// При первом копировании ВЫПОЛНИТЕ функцию init() для создания триггера с частотой выгрузки каждые 6 часов
// При обновлении скрипта достаточно заменить файл GoogleCalendar.gs и сохранить изменения, нет необходимости заново заполнять все поля(timetable id, usertype) и запускать init(),
// Но при желании Вы можете изменять поля если хотите поменять календарь или timetable id
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

var handlerFunctionName = getHandlerFunctionName()

function init() {
  var triggerExist = ScriptApp.getProjectTriggers().map(trigger => trigger.getHandlerFunction()).some(item => item === handlerFunctionName);  
  if (triggerExist) {
    return
  }
  createTimeTrigger()
}
