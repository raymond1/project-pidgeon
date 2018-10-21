//Has a next and previous
class LinkedList{
    constructor(){
        this.head = null;
    }
    append(new_item){
        if (!this.head){
            this.head = new_item;
        }else{
            var last_item = this.head;
            while (last_item.next){
                last_item = last_item.next;
            }
            last_item.next = new_item;
            new_item.previous = last_item;
        }
    }

    get last(){
        var last = this.head;
        if (!last){
            return undefined;
        }

        while(last.next){
            last = last.next;
        }
        return last;
    }

    //Returns the number of elements in the linked list
    get size(){
        var count = 0;
        var iterator = this.head;
        while (iterator){
            iterator = iterator.next;
            count++;
        }

        return count;
    }

    //Removes item from the linked list
    remove(item){
        var iterator = this.head;
        while (iterator){
            if (iterator === item){
                if (!iterator.previous){
                    //No previous item because this is the head item
                    this.head = iterator.next
                    if (iterator.next){
                        iterator.next.previous = null
                    }else{
                        
                    }
                }else{
                    var previous_item = iterator.previous
                    previous_item.next = iterator.next

                    if (!iterator.next){
                        //In case this is the last item, there is no previous attribute to set
                    }
                    else{
                        iterator.next.previous = previous_item
                    }
                }
            }
            iterator = iterator.next
        }
    }

    //Go through the linked list, and when you get to destination_item, insert the item_to_insert after it
    //If destination_item is null or undefined, put item_to_insert at the head
    insertAfter(item_to_insert,destination_item){
        var iterator = this.head

        //Insert at head
        if (!destination_item){
            if (!this.head){ //If the list was previously empty
                this.head = item_to_insert
            }
            else{
                var temp = this.head.next
                this.head = item_to_insert
                item_to_insert.next = temp

                if (temp){ //If this is not the last item in the list, it will be necessary to set the previous value
                    temp.previous = item_to_insert
                }
            }
        }else{
            while(iterator){
                if (iterator === destination_item){
                    var temp = iterator.next
                    iterator.next = item_to_insert
                    item_to_insert.previous = iterator
                    item_to_insert.next = temp
                    break
                }
                iterator = iterator.next
            }            
        }
    }
}
