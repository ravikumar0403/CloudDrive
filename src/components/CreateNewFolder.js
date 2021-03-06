import React, { useRef, useState } from "react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useAuthProvider } from "../context/AuthProvider";
import { useParams } from "react-router-dom";

const CreateNewFolder = () => {

  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuthProvider();
  const closeBtn = useRef("");
  const { folder_id } = useParams();

  async function getPath(){
    if(folder_id){
      const docRef = doc(db, "folders", folder_id);
      const docSnap = await getDoc(docRef);
      console.log(docSnap.data().name, docSnap.id);
      let path = docSnap.data().path
      path.push({
        id: docSnap.id,
        name: docSnap.data().name
      })
      console.log(path)
      return path
    }else{
      let path = [
        {
          id: "",
          name: "Drive"
        }
      ]
      console.log(path)
      return path;
    }
  }

  async function createFolder(){
    if(folderName){
      setLoading(true)
      try {
        closeBtn.current.click();
        await addDoc(collection(db, "folders"), {
              name: folderName,
              uid : currentUser.uid,
              parentFolder : folder_id || null,
              type: "folder",
              path: await getPath(),
              createdAt : serverTimestamp(),
          });
          setFolderName("")
          setLoading(false)
      } catch (e) {
          console.error("Error adding document: ", e);
          setLoading(false)
      }
    }
  }

  return (
    <>
      <button type="button" className="btn btn-secondary mx-2" data-bs-toggle="modal" data-bs-target="#new-folder-modal">
        New Folder
      </button>

      <div className="modal fade" id="new-folder-modal" tabIndex="-1" aria-labelledby="newFolderModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="newFolderModalLabel">
                New Folder
              </h5>
              <button type="button" ref={closeBtn} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
                <label htmlFor="exampleInputEmail1" className="form-label">Enter folder name</label>
                <input type="email" className="form-control" value={folderName} onChange={(e)=>setFolderName(e.target.value)}/>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" disabled={loading || !folderName} onClick={createFolder}>
              Create
            { loading && <span className="ms-3 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> }
          </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateNewFolder;
