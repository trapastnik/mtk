# Хаб МТК — `mtk.ostrov-vezeniya.ru`

Витрина мультимедийных проектов МТК (музейно-творческие комплексы) Музея В.И. Ленина, СПб.
Статический сайт: `index.html` + `styles.css` + `app.js`, данные проектов в `projects.js`.

## Состав (25.10.2026)
- **№8 «Отцы и дети»** — пульт + стена (https://8.mtk.ostrov-vezeniya.ru), внутренняя страница с тремя ссылками.
- **№12 «Политическая палитра»** — экран посетителя, демо вариантов, сводная (https://12.mtk.ostrov-vezeniya.ru).
- **№19–21 «Эмиграция и возвращение»** — три ролика (https://19-21.mtk.ostrov-vezeniya.ru), страница с тремя роликами.
- **№24 «Ленин в октябре»** — видеоролик с 3D-картой Петрограда (https://24.mtk.ostrov-vezeniya.ru).
- **№29 «Россия в Гражданской войне»** — сенсорный комплекс (https://29.mtk.ostrov-vezeniya.ru/app/).
- **№30 «Россия в эпоху Гражданской войны»** — видеоролик, без ссылки (статус `video`).
- **№31 «Политика военного коммунизма»** — в разработке, без ссылки (`soon`).
- **№32 «Болезнь и смерть. Ленин в Горках»** — https://32.mtk.ostrov-vezeniya.ru/app/.
- **№38–42 «Арт-объекты наследия»** — https://38-42.mtk.ostrov-vezeniya.ru.

Превью — `assets/previews/`, снимаются тестовой сборкой Chrome (`chrome-headless-shell`), не системным Chrome.

## Как добавить/поправить проект
Редактируется **только** `projects.js` (`window.MTK_PROJECTS`). Поля карточки:
`num, title, years, status (live|wip|proto|video|soon), url, preview, summary, tags`; без `url` карточка не кликается,
`cta` — свой текст внизу карточки; `items` + `url: "project.html?id=…"` — внутренняя страница с материалами.
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
3. Контейнер `mtk-web` (nginx:alpine, порт `8099:80`) подхватывает файлы bind-маунтом — рестарт не нужен.

`nginx.conf` и `docker-compose.yml` лежат в репозитории (versioned). nginx не отдаёт
наружу `*.conf/*.yml/*.md` и dotfiles.

Реверс-прокси `infrastructure-proxy-1` фронтит `mtk.ostrov-vezeniya.ru` (LE-серт) → `172.17.0.1:8099`.
