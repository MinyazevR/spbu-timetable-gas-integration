# spbu-timetable-integration
Интеграция расписания СПБГУ в приложения-календари.

#### Outlook, Yahoo, Yandex
Если Вы пользователь Outlook, Yahoo! или Yandex Calendar, подпишитесь на календарь по ссылке [http://194.87.237.205/calendar](http://194.87.237.205/calendar).
| Параметр | Описание |
|----:|:----:|
| type | educators, groups |
| id | timetable id группы или преподавателя |
| left_date | Левая граница даты для выгрузки расписания, YYYY-mm-dd |
| right_date | Правая граница даты для выгрузки расписания, YYYY-mm-dd |

Если не указаны левая и правая граница дат для выгрузки, то расписание будет автоматически генерироваться  и выгружаться на месяц вперед.

Пример: http://194.87.237.205/calendar?type=groups&id=334758&left_date=2023-06-01&right_date=2023-08-01.

Генератор ссылок для расписания: http://194.87.237.205/link.

#### Google Apps Script
Можно получить .ics файл с расписанием СПБГУ GET запросом, указав нужные параметры, после чего добавить ссылку в Google Calendar. Однако, Google Calendar обновляет только другие Google календари, а календари из сторонних ресурсов он может не обновлять вообще. Для получения актуального раписания пользователю необходимо предоставить разрешение на изменение своих календарей. Если Вы пользователь Google Calendar и не хотите давать доступ к своим календарям со своего аккаунта, можете создать еще один аккаунт и проследовать инструкции для Google Calendar, после чего подписаться со своего аккаунта на календарь из нового аккаунта(это будет работать, так как Google Calendar быстро обновляет подписанные Google календари).
Для получения доступа к календарям пользователей необходимо на стороне сервера настроить процесс авторизации. Необходимо продумать процесс хранения access и refresh token, в связи с чем появляются определенные риски. Google Apps Script предоставляет доступ к сервисам Google, минуя эти риски.

#### Google Calendar
1. [Перейти по ссылке](https://script.google.com/d/1Vos3LjIA47jzbv6A6SKkvc-N-Us-_iWMWJvrRUEBI7wfXhjC-J7Wt5sS/edit?usp=sharing).
2. Скопировать проект (слева во вкладке "Общие сведения").
3. Проследовать инструкции в GoogleCalendar.gs.

### В случае возникновения вопросов:
1. telegram: https://t.me/Rerrrrwww.
2. почта: st094172@student.spbu.ru
