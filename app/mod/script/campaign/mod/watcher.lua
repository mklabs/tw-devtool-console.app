local inspect = require("vendors/inspect")
local inspectOptions = { depth = 2 }

local INPUT_FILEPATH = "data/script/console/input.lua"
local ERROR_FILEPATH = "data/script/console/error.txt"
local OUTPUT_FILEPATH = "data/script/console/output.txt"
local CALLBACK_TIMER = 0.5

-- [ui] <1897.6s>  path from root:		root > character_details_panel > footer_frame > bottom_buttons > button_slot1 > button_ok
-- [ui] <1920.5s>  path from root:		root > layout > BL_parent > info_panel_holder > primary_info_panel_holder > info_panel_background > CharacterInfoPopup > rank > skills > skill_button


local function log(msg)
    out("mk: " .. tostring(msg))
end

local files = {}
local prints = {}
local _0 = nil

local function getLength(tbl)
    local count = 0
    for _ in pairs(tbl) do count = count + 1 end
    return count
end

local function split(str, delim, maxNb)
    -- Eliminate bad cases...
    if string.find(str, delim) == nil then
       return { str }
    end
    if maxNb == nil or maxNb < 1 then
       maxNb = 0    -- No limit
    end
    local result = {}
    local pat = "(.-)" .. delim .. "()"
    local nb = 0
    local lastPos
    for part, pos in string.gfind(str, pat) do
       nb = nb + 1
       result[nb] = part
       lastPos = pos
       if nb == maxNb then
          break
       end
    end
    -- Handle the last field
    if nb ~= maxNb then
       result[nb + 1] = string.sub(str, lastPos)
    end
    return result
end

local function printl(msg)
    table.insert(prints, inspect(msg, inspectOptions))
end

local function _(path)
    -- local str = "root > diplomacy_dropdown > subpanel_group > barters > barters_options > payment_parent_offer > list_box > troy_food > amount"
    local str = string.gsub(path, "%s*root%s*>%s+", "")
    local args = split(str, " > ")
    return find_uicomponent(core:get_ui_root(), unpack(args));
end

local function get_env()
    local _env = getfenv(1)

    local env = { print = printl, _ = _, _0 = _0 }
    setmetatable(env, {__index = _env})
    return env
end

local function write(filename, text)
    local file, err_str = io.open(filename, "w")
	
	if not file then
		log("ERROR: tried to create file with filename " .. filename .. " but operation failed with error: " .. tostring(err_str))
	else
		file:write(text)
		file:close()
	end
end

local function writeError(text)
    return write(ERROR_FILEPATH, text)
end

local function writeOutput(text)
    return write(OUTPUT_FILEPATH, text)
end

local function slice(tbl, first, last, step)
    local sliced = {}

    for i = first or 1, last or #tbl, step or 1 do
        sliced[#sliced+1] = tbl[i]
    end

    return sliced
end

local function shouldPrependWithReturn(text)
    -- checks begining with return
    if string.match(text, '^%s*return') then
        return false
    end

    -- checks has assignment
    if string.match(text, '%s*=%s*') then
        return false
    end

    -- checks if has any keyword
    local keywords = { "and", "break", "do", "else", "elseif", "end", "false", "for", "function", "if", "in", "local", "nil", "not", "or", "repeat", "return", "then", "true", "until", "while"}

    local hasKeyword = false
    local count = getLength(keywords)
    for i = 1, count do
        if string.match(text, '%s+' .. keywords[i] .. '%s+') then
            hasKeyword = true
            break
        end
    end

    if hasKeyword then
        return false
    end

    return true
end

local function buildCodeFromText(text)
    local sep = "\n"
    local lines = split(text, sep)
    local length = getLength(lines)

    local firsts = slice(lines, 0, length - 1)
    local lasts = slice(lines, length)
    local last = lasts[1]

    local str = ""
    str = str .. table.concat(firsts, "\n")

    if getLength(firsts) ~= 0 then
        str = str .. "\n"
    end

    if shouldPrependWithReturn(last) then
        str = str .. "\nreturn " .. last
    else
        str = str .. "\n" .. last        
    end

    return str
end

local function exec(text)
    prints = {}

    local str = buildCodeFromText(text)
    log("Trying to exec\n" .. str)

    local func, err = loadstring(str)

    if not func then
        log("Something went wrong. Error is : " .. err)
        writeError(err)
        return
    end

    setfenv(func, get_env())

    local ok, result = pcall(func)

    if not ok then 
        log("Something went wrong. Result is : " .. result)
        writeError(result)
    else
        log(inspect(result, inspectOptions))

        log("Exec inspect result is : " .. inspect(result, inspectOptions))
        log("Prints status: " .. inspect(prints, inspectOptions))

        local output = "";
        for i = 1, getLength(prints) do
            output = output .. prints[i] .. '\n';
        end

        writeOutput(output .. inspect(result, inspectOptions))
    end
end

local function getContent(filename)
    local file = io.open(filename, 'r')
    if not file then return nil end

    local result = file:read("*all")
    file:close()

    return result
end

local function watchFile(filename)
    cm:callback(function()
        local previous = files[filename] or ''

        local content = getContent(filename)
        files[filename] = content
        
        if content ~= previous then
            log(filename .. " changed.")

            exec(content)
        end

        watchFile(filename)
    end, CALLBACK_TIMER, 'watch.timer.' .. filename)
end

local function init()
    local content = getContent(INPUT_FILEPATH)
    files[INPUT_FILEPATH] = content;

    watchFile(INPUT_FILEPATH)

    core:add_listener(
		"console_store_uicomponent_on_click",
		"ComponentLClickUp",
		true,
		function(context) _0 = UIComponent(context.component) end,
		true
	);
end

cm:add_first_tick_callback(function() 
    init()
end)