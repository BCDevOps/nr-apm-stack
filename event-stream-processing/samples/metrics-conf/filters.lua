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