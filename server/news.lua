-- NEWS + EVENTS SYSTEM (SERVER AUTHORITATIVE TIME)

RegisterNetEvent("ez_tablet:clientCallback", function(name, args)

    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then return end

    local isReporter = (xPlayer.job and xPlayer.job.name == "newsreporter")

    -- =========================
    -- GET NEWS
    -- =========================
    if name == "getNews" then

        local result = MySQL.query.await([[
            SELECT 
                id,
                title,
                ingress,
                body,
                image,
                author,

                DATE_FORMAT(
                    CONVERT_TZ(created_at, @@session.time_zone, '+00:00'),
                    '%Y-%m-%dT%H:%i:%sZ'
                ) as created_at

            FROM ez_news
            ORDER BY created_at DESC
        ]])

        TriggerClientEvent("ez_tablet:callbackResponse", src, {
            name = "getNews",
            data = result,
            isReporter = isReporter
        })

        return
    end

    -- =========================
    -- GET EVENTS
    -- =========================
    if name == "getEvents" then

        local result = MySQL.query.await([[
            SELECT 
                id,
                title,
                description,

                DATE_FORMAT(
                    CONVERT_TZ(start_time, @@session.time_zone, '+00:00'),
                    '%Y-%m-%dT%H:%i:%sZ'
                ) as start_time,

                DATE_FORMAT(
                    CONVERT_TZ(end_time, @@session.time_zone, '+00:00'),
                    '%Y-%m-%dT%H:%i:%sZ'
                ) as end_time

            FROM ez_news_events
            ORDER BY start_time ASC
        ]])

        TriggerClientEvent("ez_tablet:callbackResponse", src, {
            name = "getEvents",
            data = result,
            isReporter = isReporter
        })

        return
    end

    -- =========================
    -- CREATE NEWS
    -- =========================
    if name == "createNews" then

        if not isReporter then return end

        MySQL.insert.await([[
            INSERT INTO ez_news (
                title,
                ingress,
                body,
                image,
                author,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())
        ]], {
            args.title,
            args.ingress,
            args.body,
            args.image,
            xPlayer.getName()
        })

        return
    end

    -- =========================
    -- CREATE EVENT
    -- =========================
    if name == "createEvent" then

        if not isReporter then return end

        MySQL.insert.await([[
            INSERT INTO ez_news_events (
                title,
                description,
                start_time,
                end_time
            )
            VALUES (?, ?, ?, ?)
        ]], {
            args.title,
            args.description,
            args.start_time,
            args.end_time
        })

        return
    end
end)

-- =========================
-- AUTO ARCHIVE
-- =========================
CreateThread(function()

    while true do
        Wait(60000)

        local expired = MySQL.query.await([[
            SELECT * FROM ez_news_events
            WHERE end_time <= UTC_TIMESTAMP()
        ]])

        if expired and #expired > 0 then

            for _, ev in pairs(expired) do

                MySQL.insert.await([[
                    INSERT INTO ez_news_events_past (
                        title,
                        description,
                        start_time,
                        end_time
                    )
                    VALUES (?, ?, ?, ?)
                ]], {
                    ev.title,
                    ev.description,
                    ev.start_time,
                    ev.end_time
                })

                MySQL.execute.await(
                    "DELETE FROM ez_news_events WHERE id = ?",
                    { ev.id }
                )
            end
        end
    end
end)