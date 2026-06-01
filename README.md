# Хаб МТК — `mtk.ostrov-vezeniya.ru`

Витрина мультимедийных проектов МТК (музейно-творческие комплексы) Музея В.И. Ленина, СПб.
Статический сайт: `index.html` + `styles.css` + `app.js`, данные проектов в `projects.js`.

## Состав
- **МТК №24 «Ленин в октябре»** — видео-проекция Петрограда 1917 (https://24.mtk.ostrov-vezeniya.ru).
- **МТК №29 «Гражданская война»** — мультимедийная экспозиция.
- **МТК №38–42** — серия прототипов пяти арт-объектов наследия.

## Как добавить/поправить проект
Редактируется **только** `projects.js` (`window.MTK_PROJECTS`). Поля карточки:
`num, title, years, status (live|soon|proto), url, preview, summary, tags`.
ПИН-код входа и брендовые тексты — в `window.MTK_HUB` там же.

> ПИН-гейт (`app.js`) — мягкая «занавеска», не защита (код виден в исходнике).
> Для реальной защиты — basic-auth на уровне nginx/прокси.

## Бренд
Палитра и шрифты заимствованы у МТК №24 (единый стиль Ленин-центра):
`paper #F7F9EF · brass #D2B773 · red #A02128 · graphite #435059 · ink #161B1E`,
шрифты **Nolde** (заголовки) и **20 Kopeek** (mono-лейблы).

## Деплой — ТОЛЬКО через GitHub
Прямой rsync/scp на сервер запрещён. Порядок:
1. `git push origin main`.
2. На сервере `/var/www/mtk` (git-checkout этого репо):
   `git fetch --all && git reset --hard origin/main` → `chmod -R a+rX /var/www/mtk`.
3. Контейнер `mtk-web` (nginx:alpine, порт `8097:80`) подхватывает файлы bind-маунтом — рестарт не нужен.

`nginx.conf` и `docker-compose.yml` лежат в репозитории (versioned). nginx не отдаёт
наружу `*.conf/*.yml/*.md` и dotfiles.

Реверс-прокси `infrastructure-proxy-1` фронтит `mtk.ostrov-vezeniya.ru` (LE-серт) → `172.17.0.1:8097`.
