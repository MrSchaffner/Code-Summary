window.onload = function devCount() {
    let list = document.getElementById("PersonList");
    let names = list.getElementsByTagName('p').length;
    document.getElementById("NumPersons").innerHTML = names;
    
}

    //enable popover NOT NEEDED for DROPDOWN
    //$(document).ready(function () {
    //    $('[data-bs-toggle="popover"]').popover();
    //});

    function sortTable(selectorInt, reverseOrder) {
        /**To sort by Damage, enter 1 as first parameter
         * To sort by alphabetical, enter 2 as first Parameter.
         * To sort by Date added, enter 0 as first parameter.
         * To reverse order, enter false as second parameter.
         * */
        var myTable, rows, switching, i, x, y, shouldSwitch;
        myTable = document.getElementById("myTable");
        switching = true;
        /* Make a loop that will continue until
        no switching has been done: */
        while (switching) {
            // Start by saying: no switching is done:
            switching = false;
            rows = myTable.rows;
            /* Loop through all table rows (except the
            first, which contains table headers): */
            for (i = 1; i < (rows.length - 1); i++) {
                // Start by saying there should be no switching:
                shouldSwitch = false;
                /* Get the two elements you want to compare,
                one from current row and one from the next: */
                x = rows[i].getElementsByTagName("td")[selectorInt]; //first cell
                y = rows[i + 1].getElementsByTagName("td")[selectorInt];

                if (reverseOrder) {
                    // Check if the two rows should switch place:
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                } else {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                }
            } //end for loop
            if (shouldSwitch) {
                /* If a switch has been marked, make the switch
                and mark that a switch has been done: */
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }// END WHILE LOOP
    } //end sortTableByDamageFirst()

var sortOrder = document.getElementById("sortOrder");
sortOrder.addEventListener("change", tellHowToSortTables);


function tellHowToSortTables() {

    switch (sortOrder.value) {
        case "AZ":
            sortTable(2, false);
            break;
        case "ZA":
            sortTable(2, true);
            break;
        case "damage":
            sortTable(1, true);
            break;
        case "damageRev":
            sortTable(1, false);
            break;
        case "new":
            sortTable(0, true);
            break;
        case "old":
            sortTable(0, false);
            break;
        default:
            alert("There was an error in sorting");
        // code block
    }
}
