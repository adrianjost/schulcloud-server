	Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
				.map(id => oldfileModel.findOne({ _id: id }).lean().exec().catch(errorHandler));
						.filter(f => Boolean(f))
						.map(d => FileModel.findOne(d).exec().catch(errorHandler));
				.then(files => !teacherId ? Promise.resolve() : Promise.all(
					files.filter(_ => Boolean(_)).map(file => dry