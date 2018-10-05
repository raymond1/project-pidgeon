class LinkedList{
    constructor(){
        this.head = null;
    }
    append(new_item){
        if (this.head == null){
            this.head = new_item;
        }else{
            var last_item = this.head;
            while (last_item.next != null){
                last_item = last_item.next;
            }
            last_item.next = new_item;
        }
    }

    get last(){
        var last = this.head;
        if (last == null){
            return null;
        }

        while(last.next != null){
            last = last.next;
        }
        return last;
    }
}