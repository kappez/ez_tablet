print("[YELLOWPAGES] client loaded")

-- =========================
-- GET YELLOW PAGES DATA
-- =========================
RegisterNUICallback("getYellowPages", function(_, cb)

    local data = lib.callback.await("ez_tablet:getYellowPages", false)

    if type(data) ~= "table" then
        data = {}
    end

    cb(data)
end)

-- =========================
-- NPWD CLICK TO CALL (FIXED)
-- =========================
RegisterNUICallback("yellowpages:call", function(data, cb)

    local number = data.number

    if not number then
        cb("error")
        return
    end

    print("[YELLOWPAGES] calling:", number)

    -- =========================
    -- CORRECT NPWD EXPORT
    -- =========================
    if GetResourceState("npwd") == "started" then
        exports.npwd:startPhoneCall(number)
    else
        print("[YELLOWPAGES] NPWD not started!")
    end

    cb("ok")
end)

RegisterNUICallback("yellowpages:sms", function(data, cb)

    local number = data.number
    if not number then cb("error") return end

    -- NPWD SMS event (standard)
    TriggerEvent("npwd:sendMessage", {
        number = number,
        message = ""
    })

    print("[YELLOWPAGES] SMS to:", number)

    cb("ok")
end)