-- Space delimited values to array
function sdv2array(s)
    delimiter = "%S+"
    result = {};
    for match in string.gmatch(s, delimiter) do
        table.insert(result, match);
    end
    return result;
end

function isempty(s)
    return s == nil or s == ''
end

function remove_nil_fields(tag, timestamp, record)
    return 2, timestamp, record
end


-- Small stats library                      --
----------------------------------------------
-- Version History --
-- 1.0 First written.

-- Tables supplied as arguments are not changed.
-- Credit: http://lua-users.org/wiki/SimpleStats

-- Table to hold statistical functions
stats={}

-- Get the mean value of a table
function stats.mean( t )
  local sum = 0
  local count= 0

  for k,v in pairs(t) do
    if type(v) == 'number' then
      sum = sum + v
      count = count + 1
    end
  end

  return (sum / count)
end

-- Get the median of a table.
function stats.median( t )
  local temp={}

  -- deep copy table so that when we sort it, the original is unchanged
  -- also weed out any non numbers
  for k,v in pairs(t) do
    if type(v) == 'number' then
      table.insert( temp, v )
    end
  end

  table.sort( temp )

  -- If we have an even number of table elements or odd.
  if math.fmod(#temp,2) == 0 then
    -- return mean value of middle two elements
    return ( temp[#temp/2] + temp[(#temp/2)+1] ) / 2
  else
    -- return middle element
    return temp[math.ceil(#temp/2)]
  end
end


-- Get the standard deviation of a table
function stats.standardDeviation( t )
  local m
  local vm
  local sum = 0
  local count = 0
  local result

  m = stats.mean( t )

  for k,v in pairs(t) do
    if type(v) == 'number' then
      vm = v - m
      sum = sum + (vm * vm)
      count = count + 1
    end
  end

  result = math.sqrt(sum / (count-1))

  return result
end

-- Get the max and min for a table
function stats.maxmin( t )
  local max = -math.huge
  local min = math.huge

  for k,v in pairs( t ) do
    if type(v) == 'number' then
      max = math.max( max, v )
      min = math.min( min, v )
    end
  end

  return max, min
end
-- End: Small stats library                      --

function append_event_created(tag, timestamp, record)
    new_record = record
    new_record["event.created"] = (os.date("!%Y-%m-%dT%H:%M:%S", timestamp["sec"]) .. '.' .. math.floor(timestamp["nsec"] / 1000000) .. 'Z')
    return 2, timestamp, new_record
end

function append_timestamp(tag, timestamp, record)
  new_record = record
  new_record["@timestamp"] = (os.date("!%Y-%m-%dT%H:%M:%S", timestamp["sec"]) .. '.' .. math.floor(timestamp["nsec"] / 1000000) .. 'Z')
  return 2, timestamp, new_record
end

function add_host_metadata(tag, timestamp, record)
    new_record = record
    new_record["host.os.name"] = os.getenv("HOST_OS_NAME")
    new_record["host.os.type"] = os.getenv("HOST_OS_TYPE")
    new_record["host.os.family"] = os.getenv("HOST_OS_FAMILY")
    new_record["host.os.kernel"] = os.getenv("HOST_OS_KERNEL")
    new_record["host.os.full"] = os.getenv("HOST_OS_FULL")
    new_record["host.os.version"] = os.getenv("HOST_OS_VERSION")

    new_record["host.ip"] = os.getenv("HOST_IP")
    new_record["host.mac"] = os.getenv("HOST_MAC")
    new_record["host.name"] = os.getenv("HOST_NAME")
    new_record["host.hostname"] = os.getenv("HOST_HOSTNAME")
    new_record["host.domain"] = os.getenv("HOST_DOMAIN")
    new_record["host.architecture"] = os.getenv("HOST_ARCH")

    if not(isempty(new_record["host.ip"])) then
        new_record["host.ip"] = sdv2array(new_record["host.ip"])
    else
        new_record["host.ip"] = nil
    end

    if not(isempty(new_record["host.mac"])) then
        new_record["host.mac"] = sdv2array(new_record["host.mac"])
    else
        new_record["host.mac"] = nil
    end

    if not(isempty(new_record["host.name"])) then
        new_record["host.name"] = sdv2array(new_record["host.name"])
    else
        new_record["host.name"] = nil
    end

    if not(isempty(new_record["host.domain"])) then
        new_record["host.domain"] = sdv2array(new_record["host.domain"])
    else
        new_record["host.domain"] = nil
    end

    return 2, timestamp, new_record
end

function add_system_memory_percentage(tag, timestamp, record)
    new_record = record
    if not(isempty(new_record["host.memory.used"])) and not(isempty(new_record["host.memory.total"])) then
        new_record["host.memory.used_percentage"] = record["host.memory.used"] / record["host.memory.total"]
    end
    if not(isempty(new_record["host.swap.used"])) and not(isempty(new_record["host.swap.total"])) then
        new_record["host.swap.used_percentage"] = record["host.swap.used"] / record["host.swap.total"]
    end
    return 2, timestamp, new_record
end

function modify_cpu_stats(tag, timestamp, record)
    new_record = record
    core = 0
    core_cpu = {}
    core_min = nil
    core_max = nil
    core_average = nil
    core_stddev = nil
    core_json = "["
    while(not(isempty(new_record[string.format("cpu%d.p_cpu", core)])) and not(isempty(new_record[string.format("cpu%d.p_user", core)])) and not(isempty(new_record[string.format("cpu%d.p_system", core)])) )
    do
        core_cpu[core] = new_record[string.format("cpu%d.p_cpu", core)]

        core_json = core_json .. string.format('{"usage":%f,"user":%f,"system":%f},',
            new_record[string.format("cpu%d.p_cpu", core)],
            new_record[string.format("cpu%d.p_user", core)],
            new_record[string.format("cpu%d.p_system", core)])

        new_record[string.format("cpu%d.p_cpu", core)] = nil
        new_record[string.format("cpu%d.p_user", core)] = nil
        new_record[string.format("cpu%d.p_system", core)] = nil
        core = core + 1
    end
    if core > 0 then
        core_json = core_json:sub(1, -2) .. "]"
        new_record["host.cpu.cores"] = core
        new_record["host.cpu.core_json"] = core_json
        new_record["host.cpu.core_mean"] = stats.mean(core_cpu)
        new_record["host.cpu.core_median"] = stats.median(core_cpu)
        new_record["host.cpu.core_min"], new_record["host.cpu.core_max"] = stats.maxmin(core_cpu)
        new_record["host.cpu.core_stddev"], new_record["host.cpu.core_max"] = stats.standardDeviation(core_cpu)
    end
    return 2, timestamp, new_record
end
