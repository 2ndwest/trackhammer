import "./Player.css";

export default function Player({ songInfo }) {
	console.log(songInfo);
	return (
		<div className="Player">
			<div className="Album-Container">
				<img src={songInfo.cover} alt={songInfo.track} />
			</div>
			<div className="Player-Body">
				<div className="Track-Title">
					<p>{songInfo.track}</p>
				</div>
				<div className="Artist-Container">
					<p>{songInfo.artist}</p>
				</div>
			</div>
			<div className="Button-Panel"></div>
		</div>
	);
}
