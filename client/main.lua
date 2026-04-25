
local tabletOpen = false

--====================================
-- OPEN TABLET (FROM ITEM / COMMAND)
--====================================
RegisterNetEvent("ez_tablet:open", function()

    if tabletOpen then return end

    tabletOpen = true

    -- 🔥 CRITICAL FIX FOR KEYBOARDS (Nordic / AltGr / symbols)
    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = "open"
    })

    print("[TABLET DEBUG] open event received")
end)

--====================================
-- CLOSE TABLET (FROM NUI)
--====================================
RegisterNUICallback("closeTablet", function(_, cb)

    if not tabletOpen then
        cb("ok")
        return
    end

    tabletOpen = false

    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = "close"
    })

    print("[TABLET DEBUG] tablet closed")

    cb("ok")
end)

--====================================
-- SAFE KEY HANDLING (NO INPUT BREAKING)
--====================================
CreateThread(function()

    while true do

        if not tabletOpen then
            Wait(500)
        else
            Wait(0)

            -- ❌ DO NOT disable look controls globally anymore
            -- This can interfere with NUI + keyboard layouts
            -- (Removed: DisableControlAction spam loop)

            -- =========================
            -- ESC ONLY
            -- =========================
            if IsControlJustPressed(0, 322) then
                TriggerEvent("ez_tablet:close")
            end

            -- =========================
            -- BACKSPACE ONLY (SAFE NAVIGATION)
            -- =========================
            if IsControlJustPressed(0, 177) then
                TriggerEvent("ez_tablet:close")
            end
        end
    end
end)

--====================================
-- INTERNAL CLOSE EVENT (SAFE RESET)
--====================================
RegisterNetEvent("ez_tablet:close", function()

    if not tabletOpen then return end

    tabletOpen = false

    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = "close"
    })

    print("[TABLET DEBUG] closed via keybind/event")
end)