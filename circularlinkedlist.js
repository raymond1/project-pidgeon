class CircularLinkedList{
    constructor(){
        this.pointer = null; //pointer refers to the current item
    }
    
    add(new_item){
        if (this.pointer == null){
            this.pointer = new_item;
            this.pointer.next = new_item;
        }else{
            var temp = this.pointer.next
            this.pointer.next = new_item;
            new_item.next = temp
        }
    }

    //Returns the number of elements in the linked list
    get size(){
        var iterator = this.pointer;
        if (iterator == null){
            return 0
        }

        var count = 1;

        while (iterator.next != this.pointer){
            iterator = iterator.next;
            count++;
        }

        return count;
    }
}
