function isArraySet(data, is_array) {
  if(is_array) {
   return [data]
  }
  return data
}

function pushInArray(data, new_set, key, parent_array, list) {
  const is_array = Array.isArray(data)
  if(is_array) {
    let last = data[data.length - 1]
    if(last[key] || list) {
      data.push(new_set)
    } else {
       data[data.length - 1] = { ...last, ...new_set } 
    }
    return data
  } else if(parent_array) {
      const as = [{ ...new_set, ...data }]
      return as
  }
  return {
    ...data, ...new_set
  }
}

function convertJson(start, yaml, parent_index = 0, obj = {}) {
  let space_idx = 0, is_value = false,  is_array = false, me = ''
  let cur_key = '', key = '', new_obj = {}, ite = start, old_key = key
  let arr_levels = {}, level_arr = []
  for(let  i = start; i < yaml.length; i += 1) {
    ite = i
    if((yaml[i] == ' ' || yaml[i] == '-')) {
      if(is_value == false) {
          if(yaml[i] == '-') {
            is_array = true
          }
          space_idx += 1
          continue
      }
    }
    if(yaml[i] == ':' && !is_value) {
      key = cur_key.trim()
      is_value = true
      cur_key = ''
    }
    else if(yaml[i] == '\n') {
      arr_levels[key] = i
      level_arr.push(key)
      
      if(key && cur_key) {
        new_obj[key] = cur_key.trim()
        cur_key = ''
      }
      const { 
        data, child_sidx,
        offset, list
      } = convertJson(i + 1, yaml, space_idx)
      i = offset - 1
      is_value = false
      if(child_sidx == space_idx) {
        space_idx = 0
        if(offset >= yaml.length -1) {
           if(!new_obj[key]) {
              new_obj[key] = data
              obj = data_send = new_obj
           } 
           else {
             const data_is_array = Array.isArray(data)
             if(old_key && !data_is_array) {
              const new_obj_is_array = Array.isArray(new_obj)
              let asd = new_obj 
              if(!new_obj_is_array && is_array) {
                asd = [new_obj]
              }
              obj = data_send = pushInArray(asd, data, old_key, is_array, list)
               
            } else {
              obj = data_send = pushInArray(data, new_obj, key, is_array, list) 
              if(old_key && new_obj[old_key]) {
                obj = data_send = pushInArray(obj, { [old_key]: new_obj[old_key]}, old_key, is_array, list) 
              }
            }
          }
          
          return {
            data: data_send,
            child_sidx, list: old_key ? !is_array : is_array,
            offset
          } 
        }
        // preserve old key
        old_key = key
      } 
      else if(child_sidx < space_idx) {
        let data_send
        if(!new_obj[key]) {
          new_obj[key] = data
          obj = data_send = pushInArray(new_obj, {}, key, is_array, list)
          if(key == 'matchExpressions') {
            console.log({ obj, is_array, list, new_obj })
          }
          //new_obj = {}
        } else {
          obj = data_send = pushInArray(
              data, new_obj, 
              key, is_array, 
              list
           )
        }
        if(old_key) {
          obj = data_send = pushInArray(
            obj, {
              [old_key]: new_obj[old_key],
            }, key, is_array, list
          )
        }
        return {
          data: data_send, offset,
          child_sidx, list: old_key ? !is_array : is_array
        }
      }
      if(!new_obj[key]) {
         obj = new_obj[key] = data 
        //new_obj
      }
      key = '', cur_key  = ''
    } else {
      if(space_idx < parent_index) {
        return {
          data: null,
          offset: start,
          list: is_array,
          child_sidx: space_idx
        }
      }
      cur_key += yaml[i].trim()
    }
  }

  if(cur_key && key && !new_obj[key]) {
    obj = new_obj[key.trim()] = cur_key.trim()
    //new_obj = {}
  }

  //new_obj = pushInArray(new_obj, new_obj, key, is_array)
  obj = new_obj = isArraySet(new_obj, is_array)
  //new_obj = {}
  
  return {
    data: new_obj,
    child_sidx: space_idx,
    offset: ite, list: is_array
  }
}

module.exports = function yaml2json(yaml) {
  return convertJson(0, yaml).data
}