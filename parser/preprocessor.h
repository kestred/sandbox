
// preprocess is used while tokenizing to handle trigraph replacement,
//     line splicing, macro expansion, and directive handling
void preprocess( /* TODO */ );


/* Helper functions */
// substitute does digraph and trigraph replacement on the input. 
void substitute( /* TODO */ );

// splice combines lines with escaped newline sequences and inserts an
//     equivlant number of new lines afterwords (to perserve line numbering).
void splice( /* TODO */ );